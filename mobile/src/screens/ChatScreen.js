import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import Text from '../components/AccessibleText';
import { AccessibilityContext } from '../components/AccessibilityContext';
import GeminiConsentModal from '../components/GeminiConsentModal';
import GrokConsentModal from '../components/GrokConsentModal';
import { LANGUAGES } from '../config/languages';
import {
  hasBackendUrl,
  requestConsentGrant,
  requestProviderStatus,
  requestReply,
  revokeConsentReceipt,
} from '../services/api';
import { findOfficialSourceReply } from '../services/mockAssistant';

export default function ChatScreen({ language, strings, onBack }) {
  const { textScale } = useContext(AccessibilityContext);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [error, setError] = useState(false);
  const [providerMode, setProviderMode] = useState(hasBackendUrl ? 'checking' : 'mock');
  const [geminiConsentReceipt, setGeminiConsentReceipt] = useState(null);
  const [grokConsentReceipt, setGrokConsentReceipt] = useState(null);
  const [grokAvailable, setGrokAvailable] = useState(false);
  const [pendingConsentMessage, setPendingConsentMessage] = useState(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [grokConsentOpen, setGrokConsentOpen] = useState(false);
  const scrollRef = useRef(null);
  const requestController = useRef(null);
  const requestGeneration = useRef(0);
  const pendingGeminiReceipt = useRef(null);
  const consentReceiptsRef = useRef({ gemini: null, grok: null });
  consentReceiptsRef.current = {
    gemini: geminiConsentReceipt,
    grok: grokConsentReceipt,
  };
  const languageName = LANGUAGES.find((item) => item.code === language)?.nativeName || language;

  useEffect(() => {
    let active = true;
    requestProviderStatus()
      .then((status) => {
        if (active) {
          setProviderMode(status.mode);
          setGrokAvailable(Boolean(status.providers?.grok?.available));
        }
      })
      .catch(() => {
        if (active) setProviderMode('unavailable');
      });
    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    requestGeneration.current += 1;
    requestController.current?.abort();
    const receipts = consentReceiptsRef.current;
    if (receipts.gemini) revokeConsentReceipt(receipts.gemini).catch(() => {});
    if (receipts.grok) revokeConsentReceipt(receipts.grok).catch(() => {});
    if (
      pendingGeminiReceipt.current
      && pendingGeminiReceipt.current !== receipts.gemini
    ) {
      revokeConsentReceipt(pendingGeminiReceipt.current).catch(() => {});
    }
  }, []);

  async function sendMessage(value = draft, geminiReceiptOverride = null, grokReceiptOverride = null) {
    const message = value.trim();
    if (!message || loading || checkingStatus) return;

    const officialSourceReply = findOfficialSourceReply(message, language);
    if (officialSourceReply) {
      setError(false);
      const nextMessages = [...messages, {
        id: `${Date.now()}-user`,
        role: 'user',
        text: message,
      }].slice(-12);
      setDraft('');
      setMessages([
        ...nextMessages,
        {
          id: `${Date.now()}-official-sources`,
          role: 'assistant',
          text: officialSourceReply.reply,
          mode: 'mock',
          provider: 'mock',
          sources: officialSourceReply.sources,
        },
      ]);
      return;
    }

    if (hasBackendUrl && !geminiConsentReceipt && !geminiReceiptOverride) {
      setCheckingStatus(true);
      try {
        const status = await requestProviderStatus();
        setProviderMode(status.mode);
        setGrokAvailable(Boolean(status.providers?.grok?.available));
        if (status.mode === 'live' && status.providers?.gemini?.available) {
          setPendingConsentMessage(message);
          setConsentOpen(true);
          return;
        }
        if (status.mode === 'unavailable') {
          setError(true);
          return;
        }
      } catch (_statusError) {
        setProviderMode('unavailable');
        setError(true);
        return;
      } finally {
        setCheckingStatus(false);
      }
    }

    setError(false);
    const userMessageId = `${Date.now()}-user`;
    const nextMessages = [...messages, { id: userMessageId, role: 'user', text: message }].slice(-12);
    setDraft('');
    setMessages(nextMessages);
    setLoading(true);
    const generation = ++requestGeneration.current;
    const controller = new AbortController();
    requestController.current = controller;
    const consentReceipts = {
      ...(geminiReceiptOverride || geminiConsentReceipt
        ? { gemini: geminiReceiptOverride || geminiConsentReceipt }
        : {}),
      ...(grokReceiptOverride || grokConsentReceipt
        ? { grok: grokReceiptOverride || grokConsentReceipt }
        : {}),
    };

    try {
      const providerMessages = nextMessages.map(({ role, text }) => ({ role, content: text }));
      const result = await requestReply(
        providerMessages,
        language,
        consentReceipts,
        controller.signal,
      );
      if (generation === requestGeneration.current) {
        setProviderMode(result.mode);
        setMessages((current) => [...current, {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          text: result.reply,
          mode: result.mode,
          provider: result.provider,
          sources: result.sources || [],
        }]);
      }
    } catch (requestError) {
      if (generation === requestGeneration.current && !controller.signal.aborted) {
        if (requestError.code === 'provider_consent_required') {
          setMessages((current) => current.filter((item) => item.id !== userMessageId));
          setDraft(message);
          setPendingConsentMessage(message);
          setConsentOpen(true);
        } else {
          setError(true);
        }
      }
    } finally {
      if (generation === requestGeneration.current) {
        setLoading(false);
        requestController.current = null;
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
      }
    }
  }

  function clearConversation() {
    requestGeneration.current += 1;
    requestController.current?.abort();
    requestController.current = null;
    setLoading(false);
    setMessages([]);
    setError(false);
    setConsentOpen(false);
    setGrokConsentOpen(false);
    setPendingConsentMessage(null);
    if (geminiConsentReceipt) revokeConsentReceipt(geminiConsentReceipt).catch(() => {});
    if (grokConsentReceipt) revokeConsentReceipt(grokConsentReceipt).catch(() => {});
    consentReceiptsRef.current = { gemini: null, grok: null };
    pendingGeminiReceipt.current = null;
    setGeminiConsentReceipt(null);
    setGrokConsentReceipt(null);
  }

  async function acceptGeminiConsent() {
    const message = pendingConsentMessage;
    setConsentOpen(false);
    setError(false);
    if (!message) return;
    try {
      const grant = await requestConsentGrant('gemini');
      pendingGeminiReceipt.current = grant.consent_receipt;
      setGeminiConsentReceipt(grant.consent_receipt);
      if (grokAvailable) {
        setGrokConsentOpen(true);
        return;
      }
      pendingGeminiReceipt.current = null;
      setPendingConsentMessage(null);
      sendMessage(message, grant.consent_receipt, null);
    } catch (_error) {
      setPendingConsentMessage(null);
      setError(true);
    }
  }

  async function chooseGrokConsent(allowGrok) {
    const message = pendingConsentMessage;
    setGrokConsentOpen(false);
    setPendingConsentMessage(null);
    if (!message) return;
    setError(false);
    const geminiReceipt = pendingGeminiReceipt.current || geminiConsentReceipt;
    pendingGeminiReceipt.current = null;
    if (!allowGrok) {
      sendMessage(message, geminiReceipt, null);
      return;
    }
    try {
      const grant = await requestConsentGrant('grok');
      setGrokConsentReceipt(grant.consent_receipt);
      sendMessage(message, geminiReceipt, grant.consent_receipt);
    } catch (_error) {
      setError(true);
    }
  }

  function revokeProviderConsent(provider) {
    const receipt = provider === 'gemini' ? geminiConsentReceipt : grokConsentReceipt;
    if (!receipt) return;
    if (provider === 'gemini') {
      consentReceiptsRef.current = { gemini: null, grok: null };
      setGeminiConsentReceipt(null);
      setGrokConsentReceipt(null);
      pendingGeminiReceipt.current = null;
      revokeConsentReceipt(receipt).catch(() => {});
      if (grokConsentReceipt) revokeConsentReceipt(grokConsentReceipt).catch(() => {});
    } else {
      consentReceiptsRef.current = {
        ...consentReceiptsRef.current,
        grok: null,
      };
      setGrokConsentReceipt(null);
      revokeConsentReceipt(receipt).catch(() => {});
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={strings.back} style={styles.backButton}>
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{strings.chatTitle}</Text>
          <Text style={styles.headerSub}>{languageName} · {strings.textConversation}</Text>
        </View>
        <Pressable onPress={clearConversation} accessibilityRole="button" accessibilityLabel={strings.clearChat} style={styles.clearButton}>
          <Text style={styles.clearGlyph}>⌫</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.notice}>
            <Text style={styles.noticeMark}>i</Text>
            <Text style={styles.noticeText}>{strings.mockNotice}</Text>
          </View>

          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyOrb}><Text style={styles.emptyOrbText}>आ</Text></View>
              <Text style={styles.emptyTitle}>{strings.emptyChat}</Text>
              <Pressable onPress={() => sendMessage(strings.sourceQuestion)} accessibilityRole="button" style={styles.promptChip}>
                <Text style={styles.promptChipText}>{strings.sourceQuestion}</Text>
                <Text style={styles.promptArrow}>↗</Text>
              </Pressable>
            </View>
          ) : null}

          {messages.map((item) => (
            <View key={item.id} style={[styles.messageRow, item.role === 'user' && styles.userRow]}>
              {item.role === 'assistant' ? <View style={styles.assistantAvatar}><Text style={styles.avatarText}>आ</Text></View> : null}
              <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.messageLabel, item.role === 'user' && styles.userLabel]}>{item.role === 'user' ? strings.you : strings.assistant}</Text>
                <Text style={[styles.messageText, item.role === 'user' && styles.userMessageText]}>{item.text}</Text>
                {item.role === 'assistant' && item.sources?.length ? (
                  <View style={styles.sourceList}>
                    <Text style={styles.sourceHeading}>{strings.officialSources}</Text>
                    {item.sources.map((source) => (
                      <Pressable
                        key={source.url}
                        onPress={() => Linking.openURL(source.url)}
                        accessibilityRole="link"
                        accessibilityLabel={`${strings.openOfficialSource}: ${source.title}`}
                        style={styles.sourceLink}
                      >
                        <Text style={styles.sourceTitle}>{source.title}</Text>
                        <Text style={styles.sourceScope}>
                          {source.scope === 'india' ? strings.indiaPortal : strings.maharashtraPortal}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                {item.role === 'assistant' && !item.sources?.length ? (
                  <Text style={styles.mockTag}>{item.provider === 'grok' ? strings.grokReply : item.mode === 'live' ? strings.geminiReply : strings.sampleReply}</Text>
                ) : null}
              </View>
            </View>
          ))}

          {loading ? (
            <View style={styles.loadingRow} accessibilityLiveRegion="polite">
              <ActivityIndicator color="#5B4DE6" />
              <Text style={styles.loadingText}>{strings.sending}…</Text>
            </View>
          ) : null}
          {error ? <Text style={styles.errorText} accessibilityLiveRegion="assertive">{strings.error}</Text> : null}
        </ScrollView>

        <View style={styles.composerArea}>
          <View style={styles.composer}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={strings.inputPlaceholder}
              placeholderTextColor="#858DA0"
              multiline
              maxLength={2000}
              editable={!loading && !checkingStatus}
              accessibilityLabel={strings.inputPlaceholder}
              style={[styles.input, { fontSize: 15 * textScale, lineHeight: 21 * textScale }]}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage()}
            />
            <Pressable
              onPress={() => sendMessage()}
              disabled={!draft.trim() || loading || checkingStatus}
              accessibilityRole="button"
              accessibilityLabel={strings.send}
              style={[styles.sendButton, (!draft.trim() || loading || checkingStatus) && styles.sendDisabled]}
            >
              <Text style={styles.sendArrow}>↑</Text>
            </Pressable>
          </View>
          {geminiConsentReceipt ? (
            <View style={styles.consentControls}>
              <Pressable onPress={() => revokeProviderConsent('gemini')} accessibilityRole="button" style={styles.consentActive}>
                <Text style={styles.composerHint}>{strings.geminiConsentActive} · {strings.revokeConsent}</Text>
              </Pressable>
              {grokConsentReceipt ? (
                <Pressable onPress={() => revokeProviderConsent('grok')} accessibilityRole="button" style={styles.consentActive}>
                  <Text style={styles.composerHint}>{strings.grokConsentActive} · {strings.revokeConsent}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <Text style={styles.composerHint}>
              {checkingStatus ? strings.checkProvider : providerMode === 'live' ? strings.liveMode : providerMode === 'unavailable' ? strings.status : strings.sampleReply}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
      <GeminiConsentModal
        visible={consentOpen}
        strings={strings}
        onAgree={acceptGeminiConsent}
        onCancel={() => { setConsentOpen(false); setPendingConsentMessage(null); }}
      />
      <GrokConsentModal
        visible={grokConsentOpen}
        strings={strings}
        onAgree={() => chooseGrokConsent(true)}
        onGeminiOnly={() => chooseGrokConsent(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FC' },
  header: { height: 62, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EAECF2' },
  backButton: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#F5F6FA', alignItems: 'center', justifyContent: 'center' },
  backGlyph: { color: '#353E53', fontSize: 22 },
  headerCopy: { flex: 1 },
  headerTitle: { color: '#172033', fontSize: 16, fontWeight: '800' },
  headerSub: { color: '#7B8396', fontSize: 11, marginTop: 2 },
  clearButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  clearGlyph: { color: '#737B8E', fontSize: 21 },
  keyboard: { flex: 1 },
  messages: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 18, flexGrow: 1 },
  notice: { flexDirection: 'row', gap: 9, alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: '#FFF5E9', marginBottom: 20 },
  noticeMark: { width: 20, height: 20, borderRadius: 10, textAlign: 'center', overflow: 'hidden', backgroundColor: '#FFE3C5', color: '#A65A22', fontSize: 13, lineHeight: 20, fontWeight: '900' },
  noticeText: { flex: 1, color: '#87502B', fontSize: 12, lineHeight: 17 },
  emptyState: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center', paddingBottom: 18 },
  emptyOrb: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#EAE7FF', alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyOrbText: { color: '#5B4DE6', fontSize: 30, fontWeight: '800' },
  emptyTitle: { color: '#333C51', fontSize: 16, fontWeight: '700', marginBottom: 15 },
  promptChip: { maxWidth: '100%', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 13, paddingVertical: 11, borderRadius: 14, borderWidth: 1, borderColor: '#E5E1FF', backgroundColor: '#FFFFFF' },
  promptChipText: { flexShrink: 1, color: '#5145C9', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  promptArrow: { color: '#7469D9', fontSize: 17 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 14 },
  userRow: { justifyContent: 'flex-end' },
  assistantAvatar: { width: 29, height: 29, borderRadius: 10, backgroundColor: '#5B4DE6', alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
  avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingTop: 11, paddingBottom: 10, borderRadius: 18 },
  assistantBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#E9EBF2' },
  userBubble: { backgroundColor: '#5B4DE6', borderBottomRightRadius: 5 },
  messageLabel: { color: '#737B8E', fontSize: 10, fontWeight: '800', marginBottom: 5 },
  userLabel: { color: '#D8D5FF' },
  messageText: { color: '#242D42', fontSize: 15, lineHeight: 22 },
  userMessageText: { color: '#FFFFFF' },
  mockTag: { color: '#797F91', fontSize: 10, marginTop: 8, fontWeight: '700' },
  sourceList: { marginTop: 11, paddingTop: 9, borderTopWidth: 1, borderTopColor: '#E9EBF2' },
  sourceHeading: { color: '#36415A', fontSize: 11, fontWeight: '800', marginBottom: 3 },
  sourceLink: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F1F5' },
  sourceTitle: { color: '#5145C9', fontSize: 12, lineHeight: 17, fontWeight: '700', textDecorationLine: 'underline' },
  sourceScope: { color: '#737B8E', fontSize: 10, marginTop: 2 },
  loadingRow: { flexDirection: 'row', gap: 9, alignItems: 'center', paddingVertical: 10 },
  loadingText: { color: '#727B8F', fontSize: 12 },
  errorText: { color: '#B33A3A', fontSize: 13, paddingVertical: 10 },
  composerArea: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, backgroundColor: '#FFFFFF', borderTopColor: '#EAECF2', borderTopWidth: 1 },
  composer: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F6FA', borderWidth: 1, borderColor: '#E6E8EF', borderRadius: 18, paddingLeft: 14, paddingRight: 7 },
  input: { flex: 1, maxHeight: 96, paddingVertical: 12, color: '#20293E', fontSize: 15, lineHeight: 21 },
  sendButton: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#5B4DE6', alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: '#B9B5E8' },
  sendArrow: { color: '#FFFFFF', fontSize: 23, lineHeight: 27, fontWeight: '700' },
  composerHint: { color: '#81899B', fontSize: 10, textAlign: 'center', marginTop: 7 },
  consentControls: { alignItems: 'center' },
  consentActive: { minHeight: 28, alignItems: 'center', justifyContent: 'center' },
});

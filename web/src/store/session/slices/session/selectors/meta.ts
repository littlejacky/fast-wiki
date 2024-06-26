import { t } from 'i18next';

import { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR, DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { SessionStore } from '@/store/session';
import { MetaData } from '@/types/meta';
import { merge } from '@/utils/merge';

import { sessionSelectors } from './list';

// ==========   Meta   ============== //
const currentAgentMeta = (s: SessionStore): MetaData => {
  const isInbox = sessionSelectors.isInboxSession(s);

  const defaultMeta = {
    avatar: isInbox ? DEFAULT_INBOX_AVATAR : DEFAULT_AVATAR,
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
    // @ts-ignore
    description: isInbox ? t('inbox.desc', { ns: 'chat' }) : t('noDescription'),
    
    // @ts-ignore
    title: isInbox ? t('inbox.title', { ns: 'chat' }) : t('defaultSession'),
  };

  const session = sessionSelectors.currentSession(s);

  return merge(defaultMeta, session?.meta);
};

const currentAgentTitle = (s: SessionStore) => currentAgentMeta(s).title;
const currentAgentDescription = (s: SessionStore) => currentAgentMeta(s).description;
const currentAgentAvatar = (s: SessionStore) => currentAgentMeta(s).avatar;
const currentAgentBackgroundColor = (s: SessionStore) => currentAgentMeta(s).backgroundColor;

const getAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
// @ts-ignore
const getTitle = (s: MetaData) => s.title || t('defaultSession', { ns: 'common' });
export const getDescription = (s: MetaData) =>
  // @ts-ignore
  s.description || t('noDescription', { ns: 'common' });

export const sessionMetaSelectors = {
  currentAgentAvatar,
  currentAgentBackgroundColor,
  currentAgentDescription,
  currentAgentMeta,
  currentAgentTitle,
  getAvatar,
  getDescription,
  getTitle,
};

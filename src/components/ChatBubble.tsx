import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Message } from '../types';
import { colors, borderRadius, fontSize, spacing } from '../theme';
import { format, parseISO } from 'date-fns';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  onImagePress?: (url: string) => void;
  style?: ViewStyle;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isOwn,
  onImagePress,
  style,
}) => {
  const time = format(parseISO(message.createdAt), 'h:mm a');

  return (
    <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther, style]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        {message.type === 'image' && message.imageURL ? (
          <TouchableOpacity onPress={() => onImagePress?.(message.imageURL!)}>
            <Image
              source={{ uri: message.imageURL }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
            {message.text}
          </Text>
        )}
      </View>
      <Text style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>
        {time}
        {isOwn && message.readBy.length > 1 && ' · Seen'}
      </Text>
    </View>
  );
};

// ─── Message thread header ────────────────────────────────────────────────────

interface ThreadHeaderProps {
  serviceName: string;
  startTime: string;
  barberName: string;
}

export const ThreadHeader: React.FC<ThreadHeaderProps> = ({
  serviceName,
  startTime,
  barberName,
}) => {
  const date = format(parseISO(startTime), 'EEE, MMM d · h:mm a');
  return (
    <View style={styles.threadHeader}>
      <Text style={styles.threadService}>{serviceName}</Text>
      <Text style={styles.threadMeta}>{barberName} · {date}</Text>
    </View>
  );
};

// ─── Thread list item ─────────────────────────────────────────────────────────

interface ThreadListItemProps {
  otherName: string;
  otherPhotoURL?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  onPress: () => void;
}

export const ThreadListItem: React.FC<ThreadListItemProps> = ({
  otherName,
  otherPhotoURL,
  lastMessage,
  lastMessageAt,
  unreadCount,
  onPress,
}) => {
  const time = format(parseISO(lastMessageAt), 'MMM d');
  return (
    <TouchableOpacity style={styles.threadItem} onPress={onPress} activeOpacity={0.75}>
      {otherPhotoURL ? (
        <Image source={{ uri: otherPhotoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitial}>{otherName.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={styles.threadBody}>
        <View style={styles.threadTop}>
          <Text style={[styles.threadName, unreadCount > 0 && styles.threadNameUnread]}>
            {otherName}
          </Text>
          <Text style={styles.threadTime}>{time}</Text>
        </View>
        <View style={styles.threadBottom}>
          <Text
            style={[styles.threadPreview, unreadCount > 0 && styles.threadPreviewUnread]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Bubble
  wrapper: {
    marginVertical: 2,
    maxWidth: '80%',
  },
  wrapperOwn: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '100%',
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.surfaceLight,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  textOwn: {
    color: colors.black,
  },
  textOther: {
    color: colors.text,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.md,
  },
  time: {
    fontSize: 10,
    marginTop: 2,
    marginHorizontal: spacing.xs,
  },
  timeOwn: {
    color: colors.textMuted,
  },
  timeOther: {
    color: colors.textMuted,
  },

  // Thread header
  threadHeader: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  threadService: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  threadMeta: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },

  // Thread list item
  threadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceLight,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryMuted,
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  threadBody: {
    flex: 1,
  },
  threadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  threadName: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  threadNameUnread: {
    color: colors.text,
    fontWeight: '700',
  },
  threadTime: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  threadBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  threadPreview: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    flex: 1,
  },
  threadPreviewUnread: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: spacing.sm,
  },
  unreadCount: {
    color: colors.black,
    fontSize: 11,
    fontWeight: '700',
  },
});

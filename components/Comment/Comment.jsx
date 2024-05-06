import { Avatar } from '@/components/Avatar';
import { Container } from '@/components/Layout';
import Link from 'next/link';
import clsx from 'clsx';
import { format } from '@lukeed/ms';
import { newDate } from '@/lib/utils';
import styles from './Comment.module.css';
import { useMemo } from 'react';

const Comment = ({ comment, className }) => {
  const timestampTxt = useMemo(() => {
    const diff = Date.now() - newDate(comment.createdAt).getTime();
    if (diff < 1 * 60 * 1000) return 'Just now';
    return `${format(diff, true)} ago`;
  }, [comment.createdAt]);
  return (
    <div className={clsx(styles.root, className)}>
      <Link href={`/user/${comment.creator.username}`}>
        <a>
          <Container className={styles.creator}>
            <Avatar
              size={36}
              url={comment.creator.profilePicture}
              username={comment.creator.username}
            />
            <Container column className={styles.meta}>
              <p className={styles.name}>{comment.creator.name}</p>
              <p className={styles.username}>{comment.creator.username}</p>
            </Container>
          </Container>
        </a>
      </Link>
      <div className={styles.wrap}>
        <p className={styles.content}>{comment.content}</p>
      </div>
      <div className={styles.wrap}>
        <time dateTime={String(comment.createdAt)} className={styles.timestamp}>
          {timestampTxt}
        </time>
      </div>
    </div>
  );
};

export default Comment;

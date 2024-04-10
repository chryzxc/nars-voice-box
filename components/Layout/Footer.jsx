import { Text, TextLink } from '@/components/Text';

import Spacer from './Spacer';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import Wrapper from './Wrapper';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Wrapper>
        <Text color="accents-7">Made with ❤️, 🔥, and a keyboard by .</Text>
        <Spacer size={1} axis="vertical" />
        <ThemeSwitcher />
      </Wrapper>
    </footer>
  );
};

export default Footer;

import { Text } from '@/components/Text';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import Wrapper from './Wrapper';
import styles from './Footer.module.css';
const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Wrapper>
        <Text color="accents-7">
          Made with ❤️, 🔥, and a keyboard by Christian Villablanca
        </Text>

        <ThemeSwitcher />
      </Wrapper>
    </footer>
  );
};

export default Footer;

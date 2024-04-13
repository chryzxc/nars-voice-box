import { ForgetPasswordIndex } from '@/page-components/ForgetPassword';
import Head from 'next/head';

const ForgetPasswordPage = () => {
  return (
    <>
      <Head>
        <title>Forget password</title>
      </Head>
      <div>
        <p className="font-bold text-lg">Test123</p>
      </div>
      <ForgetPasswordIndex />
    </>
  );
};

export default ForgetPasswordPage;

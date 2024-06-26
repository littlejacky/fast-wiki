import { Button } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import UserInfo from '@/features/User/UserInfo';

const UserLoginOrSignup = memo<{ onClick: () => void }>(({ onClick }) => {
  const { t } = useTranslation('auth') as any;;

  return (
    <>
      <UserInfo />
      <Flexbox paddingBlock={'0 12px'} paddingInline={16} width={'100%'}>
        <Button block onClick={onClick} type={'primary'}>
          {t('loginOrSignup')}
        </Button>
      </Flexbox>
    </>
  );
});

export default UserLoginOrSignup;

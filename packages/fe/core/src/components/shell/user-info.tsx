import { IconAt, IconPhoneCall } from '@tabler/icons-react';
import { Avatar, Group, Text } from '@mantine/core';
import '../../styles.css'

export function UserInfo(props: {user: any}) {
  console.log('UserInfo props: ', props.user);
  return (
    <div className='mx-3 my-4'>
      <Group wrap="nowrap">
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
          size={72}
          radius="120 "
        />
        <div>

          <Text fz="lg" fw={500} className='text-blue-950'>
            {props.user?.profile?.firstName + ' ' + props.user?.profile?.lastName}
          </Text>
          <Text  fw={300}>
            CEO
          </Text>
        </div>
      </Group>
    </div>
  );
}
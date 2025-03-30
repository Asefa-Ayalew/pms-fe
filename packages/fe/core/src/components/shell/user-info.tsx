import { IconAt, IconPhoneCall } from '@tabler/icons-react';
import { Avatar, Group, Text } from '@mantine/core';
import '../../styles.css'

export function UserInfo() {
  return (
    <div className='mx-3 my-8'>
      <Group wrap="nowrap">
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
          size={94}
          radius="120 "
        />
        <div>

          <Text fz="lg" fw={500} className='text-blue-950'>
            Nolawi Mekuriaw
          </Text>
          <Text  fw={300}>
            Software engineer
          </Text>

          {/* <Group wrap="nowrap" gap={10} mt={3}>
            <IconAt stroke={1.5} size={16} />
            <Text fz="xs" c="dimmed">
              robert@glassbreaker.io
            </Text>
          </Group>

          <Group wrap="nowrap" gap={10} mt={5}>
            <IconPhoneCall stroke={1.5} size={16}  />
            <Text fz="xs" c="dimmed">
              +11 (876) 890 56 23
            </Text>
          </Group> */}
        </div>
      </Group>
    </div>
  );
}
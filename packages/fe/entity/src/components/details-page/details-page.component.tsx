"use client";
import { JSX } from 'react'
import type { ReactNode } from "react";

// import { Button, Divider, Empty, Image, Table, Typography } from "antd";

import { Badge, Button, Card, Table, Text } from "@mantine/core";
import { IconListDetails, IconStarFilled } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React from "react";
import EmptyIcon from "../../icons/empty-icon";
import DetailsPageSkeleton from "./details-page-skeleton.component";
export interface DataType {
  key: string;
  label: string;
  value: any;
  type?: "string" | "date" | "number" | "boolean";
}

interface ProfileHeaderDataType {
  image: string | false;
  name: any;
  type: any;
  address: string;
  phone: string;
  email: string;
  isVerified: boolean;
}

interface ProfileHeaderProps {
  profile: ProfileHeaderDataType;
  editUrl: string;
  hideEditButton: boolean;
  children?: ReactNode;
}

export interface DetailsConfig {
  isProfile: boolean;
  title: any;
  editUrl?: string;
  widthClass?: string;
  hideEditButton?: boolean;
}

interface Props {
  dataSource: Array<{
    title: string;
    source: DataType[];
  }>;
  config: DetailsConfig;
  description?: string;
  profileData?: ProfileHeaderDataType;
  additionalActions?: ReactNode;
  isLoading: boolean;
}

export default function DetailsPage(props: Props): JSX.Element {
  const {
    dataSource,
    profileData,
    description,
    additionalActions,
    config,
    isLoading,
  } = props;
  const [profilePic, setProfilePic] = React.useState<any>(profileData?.image);

  const handleImageChange = (event: any) => {
    const file = event;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const {
    isProfile,
    title,
    editUrl = "",
    widthClass = "max-w-2xl",
    hideEditButton = false,
  } = config;

  if (isLoading) {
    return (
      <DetailsPageSkeleton showProfile={isProfile} widthClass={widthClass} />
    );
  }

  if (!isLoading && dataSource.length === 0) {
    return <EmptyIcon />;
  }
  return (
    <div className={`p-4 mx-auto font-roboto ${widthClass}`}>
      {isProfile && profileData !== undefined ? (
        <ProfileHeader
          profile={profileData}
          editUrl={editUrl}
          hideEditButton={hideEditButton}
        >
          {additionalActions}
        </ProfileHeader>
      ) : (
        <div className="flex justify-between items-center p-2 gap-2">
          {/* <Title order={4} className="mb-0">
            {title}
          </Title> */}
          {!hideEditButton && <EditButton editUrl={editUrl} />}
          {additionalActions}
        </div>
      )}

      {dataSource.map(({ title, source }) => {
        return (
          <section
            className="mb-8 flex flex-col space-y-4 mt-8 last:mb-0 font-sans"
            key={title}
          >
            <Table>
              <Table.Tbody>
                {source.map((data) => (
                  <Table.Tr key={data.key}>
                    <Table.Td>{data.label}</Table.Td>
                    <Table.Td>
                      {Array.isArray(data.value)
                        ? data.value.map((value, index) => (
                            <Badge
                              color="primary"
                              variant="light"
                              mx={1}
                              key={index}
                            >
                              {value}{" "}
                            </Badge>
                            // <div key={index}></div>
                          ))
                        : data.value}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {description ? (
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500} mb="sm">
                  Department Description:
                </Text>

                <div dangerouslySetInnerHTML={{ __html: description ?? "" }} />
              </Card>
            ) : (
              ""
            )}
          </section>
        );
      })}
    </div>
  );
}

function ProfileHeader(props: ProfileHeaderProps): JSX.Element {
  const { profile, editUrl, children = null, hideEditButton } = props;
  const { image, name, type, address, phone, email, isVerified } = profile;

  return (
    <section
      id="profile-header"
      className="flex gap-2 bg-gray-100 p-4 rounded-sm"
    >
      {image !== false && (
        // <div className="w-24 h-24 flex-shrink-0 bg-gray-200 flex items-center justify-center rounded-full">
        //   <Image className="rounded-full" src={image} />
        // </div>
        <div className=""></div>
      )}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-0.5">
          {name}
          {isVerified && <IconStarFilled />}
        </h1>
        <h2 className="text-xl">{type}</h2>

        <div className="mt-3">
          <Text className="block">{address}</Text>
          <Text className="block">{phone}</Text>
          <Text className="block">{email}</Text>
        </div>
      </div>

      <div className="ml-auto self-start flex items-center gap-2">
        {!hideEditButton && <EditButton editUrl={editUrl} />}
        {children}
      </div>
    </section>
  );
}

function EditButton({ editUrl }: { editUrl: string }): JSX.Element {
  const router = useRouter();

  return (
    <Button
      leftSection={<IconListDetails size={12} />}
      variant="filled"
      radius={"xl"}
      className="w-max ml-auto  flex items-center gap-0.5 bg-primary-500 text-white"
      onClick={() => {
        router.push(editUrl);
      }}
    >
      Edit
    </Button>
  );
}

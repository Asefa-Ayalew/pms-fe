"use client";
import { EmergencyContact } from "@/src/models/emergency-contact.model";
import { Role } from "@/src/models/role.model";
import EntityList from "@/src/shared/entity/entity-list";
import { CollectionQuery, Order } from "@/src/shared/models/collection.model";
import { EntityConfig } from "@/src/shared/models/entity-config.model";
import { Card, Divider, Modal } from "@mantine/core";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLazyGetRolesQuery } from "../../role/_store/role.query";
import {
    useDeleteEmergencyContactMutation,
    useLazyGetUserQuery
} from "../_store/emergency-contact.query";

export default function UserRolesComponent() {
    const [modals, setModals] = useState({
        new: false,
        edit: false,
        view: false,
        archive: false,
    });

    const params = useParams();
    const searchParams = useSearchParams();

    const [popoverOpened, setPopoverOpened] = useState<string | undefined>(
        undefined
    );



    const [deleteEmergencyContact, { isLoading: deleting }] = useDeleteEmergencyContactMutation();
    const [getUser, user] = useLazyGetUserQuery();
    const [getRoles, roles] = useLazyGetRolesQuery();

    const [collection, setCollection] = useState<CollectionQuery>({
        skip: 0,
        top: 20,
        filter: [[{ field: "userId", value: params.id, operator: "=" }]],
        orderBy: [{ field: "createdAt", direction: "desc" }],
    });
    const [roleCollection, setUserCollection] = useState<CollectionQuery>({
        orderBy: [{ field: "createdAt", direction: "desc" }],
    })
    useEffect(() => {
        getUser({
            id: `${params?.id}`,
            includes: ["userRoles", "userContacts"],
        });
    }, [params?.id]);
    useEffect(() => {
        getRoles(roleCollection);
    }, [roleCollection]);
    const userRoles = user?.data?.userRoles;
    const mappedUserRoles = Array.isArray(userRoles) ? userRoles.map((userRole) => {
        const role = roles?.data?.data.find((r) => r.id === userRole.roleId);
        return role
            ? {
                userId: userRole.userId,
                roleId: userRole.roleId,
                name: role.name,
                description: role.description,
                key: role.key,
            }
            : null;
    }).filter(Boolean) : []
    console.log("This is the roles", roles);

    const config: EntityConfig<Role> = {
        primaryColumn: {
            key: "name",
            name: "Role Name",
            render: (data: Role) =>
                `${data?.name ?? ""}`,
        },
        rootUrl: "/user",
        identity: "id",
        showDetail: false,
        visibleColumn: [
            { name: "Name", key: "name" },
            { name: "Description", key: "description" },
            { name: "Key", key: "key" },
            { name: "Created On", key: "createdAt", isDate: true },
        ],
        newAction: () => openModal("new"),
        actions: [
            { label: "Show More", icon: "IconEye", key: "showMore", type: "primary" },
            {
                label: "Edit",
                icon: "IconEdit",
                key: "edit",
                type: "primary",
                divider: true,
            },
            { label: "Delete", icon: "IconTrash", key: "delete", type: "danger" },
        ],
    };
    const onSearch = (data: string) => {
        setCollection((prev) => ({
            ...prev,
            search: data || "",
        }));
    };

    // useEffect(() => {
    //     getEmergencyContacts(collection);
    // }, [collection, getEmergencyContacts]);

    const openModal = (type: keyof typeof modals, room?: EmergencyContact) => {

        setModals((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const closeModal = (type: string) => {
        setModals((prev) => ({ ...prev, [type]: false }));

    };
    const handleAction = (action: { key: string }, data?: EmergencyContact) => {
        switch (action.key) {
            case "showMore":
                openModal("view", data);
                break;
            case "edit":
                openModal("edit", data);
                break;
            case "delete":
                openModal("archive", data);
                break;
            default:
                console.warn("Unknown action:", action);
        }
    };
    const handleNewModal = () => {
        openModal("new");
    };
    const renderModal = (
        type: keyof typeof modals,
        title: string,
        size: string,
        content: JSX.Element
    ) => (
        <Modal
            opened={modals[type]}
            onClose={() => closeModal(type)}
            title={title}
            centered
            size={size}
        >
            <Divider />
            {content}
        </Modal>
    );

    return (
        <Card shadow="sm" padding="sm" >
            <EntityList
                viewMode="list"
                parentStyle="w-full"
                showArchived={false}
                showSelector={true}
                tableKey="roles"
                title=""
                newButtonText="Assign New Role"
                total={mappedUserRoles?.length}
                collectionQuery={collection}
                config={config}
                items={mappedUserRoles}
                showNewButton={false}
                showNewModal={true}
                initialPage={1}
                defaultPageSize={collection.top}
                pageSize={[20, 30, 50, 100]}
                onPaginationChange={(skip: number, top: number) => {
                    const after = (skip - 1) * top;
                    setCollection({ ...collection, skip: after, top: top });
                }}
                onSearch={(data: any) => {
                    setCollection({
                        ...collection,
                        search: data || "",
                        searchFrom: data ? ["name"] : [],
                    });
                }}
                onFilterChange={(data: any) => {
                    if (data.length > 0) {
                        setCollection({ ...collection, withArchived: true });
                    } else {
                        setCollection({ ...collection, withArchived: false });
                    }
                }}
                onOrder={(data: Order) =>
                    setCollection({ ...collection, orderBy: [data] })
                }
                handleAction={handleAction}
                handleNewModal={handleNewModal}
            />

            {/* {
                renderModal(
                    "new",
                    "Assign new role",
                    "50%",
                    <EmergencyContactForm editMode="new" onClose={() => closeModal("new")} />
                )}
            {
                renderModal(
                    "edit",
                    "Edit Emergency Contact",
                    "50%",
                    <EmergencyContactForm
                        editMode="detail"
                        onClose={() => closeModal("edit")}
                        // data={selectedEmergencyContact}
                    />
                )
            }
            {
                renderModal(
                    "view",
                    "View Emergency Contact",
                    "50%",
                    <EmergencyContactForm
                        editMode="view"
                        onClose={() => closeModal("view")}
                        data={selectedEmergencyContact}
                    />
                )}
            {
                renderModal(
                    "archive",
                    "Reason",
                    "50%",
                    <ReasonForm
                        id={selectedEmergencyContact?.id ?? ""}
                        onClose={() => closeModal("archive")}
                    />
                )} */}
        </Card>
    );
}

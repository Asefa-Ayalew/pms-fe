'use client';
import '../styles.css';
import {
  Button,
  Checkbox,
  ComboboxItem,
  Divider,
  Flex,
  Group,
  Loader,
  Menu,
  Modal,
  Pagination,
  Select,
  Stack,
  Table,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import * as TablerIcons from '@tabler/icons-react';
import {
  IconCaretDownFilled,
  IconCaretUpFilled,
  IconCheck,
  IconChevronRight,
  IconDots,
  IconDotsVertical,
  IconFileExport,
  IconFilter,
  IconMinus,
  IconPlus,
  IconPrinter,
} from '@tabler/icons-react';
import dateFormat from 'dateformat';
import * as FileSaver from 'file-saver';
import { debounce } from 'lodash-es';
import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { RootState } from '../store/store';
import { Icon } from '@tabler/icons-react';
import Link from 'next/link';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import ReactToPrint from 'react-to-print';
import * as XLSX from 'xlsx';
import EmptyIcon from '../icons/empty-icon';
import { CollectionQuery } from '../models/collection.model';
import { EntityConfig, entityViewMode } from '../models/entity-config.model';
import { PaginationOptions } from '../models/pagination.model';
import {
  removeEntityListCollection,
  setEntityListCollection,
  setUiState,
} from '../utilities/entity-list-slice';

type FunctionType = (args: any) => void;
interface Props<T> {
  config?: EntityConfig<T>;
  tableKey?: string;
  detail?: ReactNode;
  check?: boolean;
  showNewButton?: Boolean;
  showNewModal?: Boolean;
  newButtonText?: string;
  showExport?: boolean;
  showArchived?: boolean;
  showSelector?: boolean;
  viewMode: entityViewMode;
  collectionQuery?: CollectionQuery;
  items?: any[];
  selectedItem?: any;
  itemsLoading?: boolean;
  pageSize?: number[];
  showTotal?: boolean;
  defaultPageSize?: number;
  initialPage?: number;
  parentStyle?: string;
  total: any;
  header?: any;
  loading?: boolean;
  title: string | ReactElement<any>;
  detailWidth?: any;
  detailTitle?: any;
  //Action emitters
  onItemsSelected?: FunctionType;
  onShowArchived?: FunctionType;
  onShowSelector?: FunctionType;
  onViewAll?: FunctionType;
  onDetail?: FunctionType;
  onPaginationChange: (skip: number, top: number) => void;
  onSearch?: FunctionType;
  onFilterChange?: any;
  onOrder?: FunctionType;
  printModalChange?: any;
  exportExcelChange?: any;
  hasGenerateButton?: boolean;
  onGenerateButton?: FunctionType;
  handleAction?: (action: any, item: any) => void;
  handleNewModal?: () => void;
}

export default function EntityList<T>(props: Props<T>) {
  const {
    detailWidth = { list: 'md:w-3/12', content: 'md:w-9/12' },
    viewMode,
    detail,
    selectedItem = [],
    items,
    config,
    tableKey,
    title,
    itemsLoading,
    total,
    showTotal,
    defaultPageSize,
    onPaginationChange,
    onSearch,
    onShowArchived,
    onShowSelector,
    onFilterChange,
    onOrder,
    onItemsSelected,
    onViewAll,
    onDetail,
    detailTitle,
    showNewButton = true,
    showNewModal = false,
    newButtonText = 'New',
    showArchived = true,
    header,
    parentStyle,
    showExport,
    showSelector = true,
    collectionQuery,
    hasGenerateButton,
    onGenerateButton,
    handleAction,
    handleNewModal,
  } = props;

  const params = useParams();
  const pdfRef = useRef(null);
  const navigate = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const [opened, { open, close }] = useDisclosure(false);
  const [printItems, setPrintItems] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<any[]>([]);
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [check, setCheck] = useState<boolean>(props?.check ?? false);
  const [filterOptions, setFilterOptions] = useState([]);
  const [pageIndex, setPageIndex] = useState<number>(props.initialPage ?? 1);
  const [pageSize, setPageSize] = useState<number>(props.defaultPageSize ?? 20);

  const [defaultValue] = useState<EntityConfig<T>>({
    rootUrl: '',
    detailUrl: 'detail',
    identity: 'id',
    name: '',
    visibleColumn: [],
    primaryColumn: { name: 'Name', key: 'name' },
    showFullScreen: true,
    showClose: true,
    hasActions: false,
    showDetail: true,
    actions: [],
  });

  const collections = useSelector(
    (state: RootState) => state?.entityListReducer?.collections,
  );

  const collection = collections?.filter((item: any) => item?.key === tableKey);

  const viewAll = useSelector(
    (state: RootState) => state.entityListReducer.viewAll,
  );

  const [setting, setSetting] = useState<EntityConfig<T>>();
  const [filterValue, setFilterValue] = useState<string[]>([]);
  const [filterMenus, setFilterProps] = useState<any>();
  const [order, setOrder] = useState<{ field: string; direction: string }>({
    field: '',
    direction: '',
  });

  //Persisting table state from redux
  useEffect(() => {
    if (collection && searchParams?.size === 0) {
      let filters: string[] = [];
      collection?.[0]?.collection?.filter?.forEach((item: any) => {
        item?.forEach((filter: any) => {
          filters.push(JSON.stringify(filter));
        });
      });

      if (collection?.[0]?.collection?.orderBy) {
        onOrder?.({
          field: collection?.[0]?.collection?.orderBy?.[0]?.field,
          direction: collection?.[0]?.collection?.orderBy?.[0]?.direction,
        });
        setOrder({
          field: collection?.[0]?.collection?.orderBy?.[0]?.field,
          direction:
            collection?.[0]?.collection?.orderBy?.[0]?.direction ?? 'desc',
        });
      }
      if (collection?.[0]?.collection?.search) {
        onSearch?.(collection?.[0]?.collection?.search);
      }
      setFilterValue(filters);
    }
  }, []);

  useEffect(() => {
    if (
      collectionQuery?.skip !== 0 ||
      collectionQuery?.top !== 20 ||
      collectionQuery?.search ||
      (collectionQuery?.filter && collectionQuery?.filter?.length > 0) ||
      (collectionQuery?.orderBy && collectionQuery?.orderBy?.length > 0)
    ) {
      dispatch(
        setEntityListCollection({ key: tableKey, collection: collectionQuery }),
      );
    }
  }, [collectionQuery, tableKey]);

  useEffect(() => {
    setSetting({
      ...defaultValue,
      ...config,
    });

    if (config?.filter && config?.filter?.length > 0) {
      let filterTemp: any[] = [];
      config?.filter?.forEach((item: any, idx: any) => {
        {
          item.forEach((filter: any, index: any) => {
            filterTemp?.push({
              key: filter.field + index,
              label: (
                <Checkbox value={JSON.stringify(filter)} label={filter?.name} />
              ),
            });
          });
        }

        setting !== undefined &&
          setting?.filter?.length !== idx + 1 &&
          filterTemp?.push({
            type: 'divider',
          });
      });
      setFilterProps({ items: filterTemp });
    }
  }, [config, defaultValue]);

  useEffect(() => {
    if (onItemsSelected) {
      onItemsSelected(checkedItems);
    }
  }, [checkedItems]);

  useEffect(() => {
    onFilterChange(filterQuery(filterValue));
  }, [filterValue]);

  useEffect(() => {
    setCheck(props?.check ?? check);
  }, [props?.check]);

  useEffect(() => {
    onShowSelector?.(check);
  }, [check]);

  useEffect(() => {
    if (allChecked) {
      setCheckedItems(items ? items : []);
    } else {
      setCheckedItems([]);
    }
  }, [allChecked]);

  useEffect(() => {
    if (check && opened && checkedItems.length === 0) {
      notifications.show({
        title: 'Warning',
        message: 'Please select items to export',
      });
    } else if (check) {
      setPrintItems(checkedItems);
    } else {
      setPrintItems(items ? items : []);
    }
  }, [opened]);

  useEffect(() => {
    setFullScreen(setting?.showFullScreen ?? fullScreen);
  }, [setting?.showFullScreen]);

  const filterQuery = (data: string[]) => {
    let filterQueryValue: any[] = [];
    const filterMap: { [key: string]: any[] } = {};
    data.forEach((item) => {
      filterMap[JSON.parse(item)?.field] = data.filter(
        (query) => JSON.parse(query)?.field === JSON.parse(item).field,
      );
    });
    // constructs the filter query into array form the grouped object
    Object.keys(filterMap).forEach((key) => {
      filterQueryValue = [
        ...filterQueryValue,
        filterMap[key].map((item) => JSON.parse(item)),
      ];
    });
    return filterQueryValue;
  };

  const exportToExcel = async () => {
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset-UTF-8;';
    const fileExtension = '.xlsx';
    if (check && checkedItems.length === 0) {
      notifications.show({
        title: 'Warning',
        message: 'Please select items to export',
      });
      return null;
    }
    const exportItems = check ? checkedItems : items;
    const exportData: any = exportItems?.map((item, index) => {
      let data: any = {};

      setting?.visibleColumn.map((col: any, idx: any) => {
        if (col?.print !== false && col?.hide !== true) {
          if (!Array.isArray(col.key)) {
            if (col?.isDate) {
              return (data[`${col.key}`] = item[`${col.key}`]
                ? dateFormat(item[`${col.key}`], 'mmm dS, yyyy ')
                : '');
            } else {
              return (data[`${col.key}`] = item[`${col.key}`]);
            }
          } else {
            if (col?.isDate) {
              return (data[`${col.key}`] = childeView(item, col.key)
                ? dateFormat(childeView(item, col.key), 'mmm dS, yyyy ')
                : '');
            } else {
              return (data[`${col.key}`] = childeView(item, col.key));
            }
          }
        }
      });
      return data;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, title + fileExtension);
  };

  const childeView = (item: any, keys: string[]) => {
    if (keys.length && item) {
      keys.forEach((key: any) => {
        if (item[key] !== null && item[key] !== undefined) {
          item = item[key];
        } else {
          item = '';
        }
      });
    }

    return item;
  };

  const exportDropdown = [
    {
      key: 'pdf',
      onClick: () => {
        if (check && checkedItems.length === 0) {
          notifications.show({
            title: 'Warning',
            message: 'Please select items to export',
          });
        } else {
          close();
        }
      },
      label: (
        <div className="flex space-x-2 w-16 justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="fill-current h-6"
            viewBox="0 0 50 50"
          >
            <path d="M7 1L7 47L36.109375 47L34.371094 45L9 45L9 3L28 3L28 15.996094L41 15.996094L41 28L43 28L43 15.164062 A 1.0001 1.0001 0 0 0 43 14.837891L43 14.564453L29.392578 1L7 1 z M 30 4.3964844L39.566406 13.996094L30 13.996094L30 4.3964844 z M 22.78125 18C22.028935 18 21.253835 18.427081 20.910156 19.056641C20.566477 19.6862 20.546541 20.36366 20.630859 21.066406C20.763775 22.174191 21.267209 23.43153 21.919922 24.712891C21.595405 25.809154 21.438694 26.76284 20.951172 27.929688C20.330121 29.416125 19.569007 30.597863 18.835938 31.835938C17.88317 32.281028 16.681507 32.679453 15.978516 33.140625C15.189066 33.658515 14.565947 34.126043 14.199219 34.863281C14.015855 35.2319 13.922225 35.753316 14.103516 36.226562C14.28407 36.697896 14.658028 37.007129 15.044922 37.208984C15.863507 37.639163 16.809958 37.371839 17.494141 36.910156C18.178837 36.448127 18.789777 35.773298 19.402344 34.949219C19.712541 34.531913 19.958459 33.85494 20.261719 33.367188C21.240151 32.932223 21.935939 32.486031 23.048828 32.101562C24.553385 31.581785 25.893402 31.365042 27.298828 31.058594C28.476157 31.85346 29.728468 32.466797 31.09375 32.466797C31.866941 32.466797 32.46371 32.434337 33.046875 32.117188C33.63004 31.800041 33.982422 31.038382 33.982422 30.457031C33.982422 29.983365 33.773696 29.48155 33.445312 29.15625C33.116929 28.83095 32.724031 28.660322 32.324219 28.552734C31.524593 28.33756 30.618766 28.349782 29.576172 28.458984C29.024169 28.516804 28.288781 28.80721 27.675781 28.923828C27.595001 28.858288 27.513978 28.830998 27.433594 28.761719C26.185994 27.686458 25.018321 26.201546 24.152344 24.726562C24.098894 24.635523 24.107701 24.577353 24.056641 24.486328C24.266529 23.69528 24.68182 22.779424 24.775391 22.085938C24.904314 21.130439 24.932438 20.293831 24.701172 19.527344C24.585535 19.1441 24.389799 18.759495 24.048828 18.460938C23.707857 18.162379 23.229454 18 22.78125 18 z M 22.697266 19.992188C22.710178 19.992955 22.725942 19.999966 22.748047 20.003906C22.752047 20.010206 22.757449 20.007106 22.787109 20.105469C22.842359 20.288574 22.809436 20.808928 22.791016 21.269531C22.767116 21.150492 22.629849 20.933661 22.617188 20.828125C22.561267 20.36209 22.635553 20.067855 22.664062 20.015625C22.674287 19.996895 22.684353 19.99142 22.697266 19.992188 z M 23.302734 27.009766C23.918277 27.897453 24.604402 28.722196 25.369141 29.486328C24.343936 29.759437 23.427764 29.854662 22.396484 30.210938C22.179842 30.285777 22.051966 30.387503 21.837891 30.464844C22.14389 29.82916 22.521784 29.359582 22.796875 28.701172C23.046004 28.104902 23.087712 27.602931 23.302734 27.009766 z M 38 30L38 39L33 39L41.693359 49.003906L50 39L45 39L45 30L38 30 z M 40 32L43 32L43 41L46 41L41.693359 46L37 41L40 41L40 32 z" />
          </svg>
        </div>
      ),
    },
    {
      key: 'excel',
      onClick: () => {
        exportToExcel();
      },
      label: (
        <div className="flex space-x-2 w-16 justify-center ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="fill-current h-6 "
            viewBox="0 0 50 50"
          >
            <path d="M28.875 0C28.855469 0.0078125 28.832031 0.0195313 28.8125 0.03125L0.8125 5.34375C0.335938 5.433594 -0.0078125 5.855469 0 6.34375L0 43.65625C-0.0078125 44.144531 0.335938 44.566406 0.8125 44.65625L28.8125 49.96875C29.101563 50.023438 29.402344 49.949219 29.632813 49.761719C29.859375 49.574219 29.996094 49.296875 30 49L30 44L47 44C48.09375 44 49 43.09375 49 42L49 8C49 6.90625 48.09375 6 47 6L30 6L30 1C30.003906 0.710938 29.878906 0.4375 29.664063 0.246094C29.449219 0.0546875 29.160156 -0.0351563 28.875 0 Z M 28 2.1875L28 6.53125C27.867188 6.808594 27.867188 7.128906 28 7.40625L28 42.8125C27.972656 42.945313 27.972656 43.085938 28 43.21875L28 47.8125L2 42.84375L2 7.15625 Z M 30 8L47 8L47 42L30 42L30 37L34 37L34 35L30 35L30 29L34 29L34 27L30 27L30 22L34 22L34 20L30 20L30 15L34 15L34 13L30 13 Z M 36 13L36 15L44 15L44 13 Z M 6.6875 15.6875L12.15625 25.03125L6.1875 34.375L11.1875 34.375L14.4375 28.34375C14.664063 27.761719 14.8125 27.316406 14.875 27.03125L14.90625 27.03125C15.035156 27.640625 15.160156 28.054688 15.28125 28.28125L18.53125 34.375L23.5 34.375L17.75 24.9375L23.34375 15.6875L18.65625 15.6875L15.6875 21.21875C15.402344 21.941406 15.199219 22.511719 15.09375 22.875L15.0625 22.875C14.898438 22.265625 14.710938 21.722656 14.5 21.28125L11.8125 15.6875 Z M 36 20L36 22L44 22L44 20 Z M 36 27L36 29L44 29L44 27 Z M 36 35L36 37L44 37L44 35Z" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div className={`h-full flex space-x-2  relative p-2 ` + parentStyle}>
      <div
        className={`flex-col  space-y-2 ${
          viewMode !== 'detail'
            ? 'w-full'
            : !fullScreen
              ? detailWidth.list
              : 'hidden'
        }`}
      >
        <div className="h-14 rounded bg-white  flex items-center justify-between p-2 border space-x-2">
          <div className="h-full w-full flex-grow items-center font-semibold ">
            {title}
          </div>

          <div className="h-full justify-end flex space-x-4 items-center">
            {filterValue.length > 0 && viewMode !== 'detail' && (
              <div
                className="flex shrink-0 px-2"
                onClick={() => {
                  setFilterValue([]);
                  onSearch?.('');
                  onOrder?.('');
                  dispatch(removeEntityListCollection(tableKey ?? ''));
                  dispatch(setUiState(false));
                }}
              >
                <span className="shrink-0 text-blue-500 cursor-pointer">
                  Reset Filters
                </span>
              </div>
            )}

            {tableKey === 'dispatches' && (
              <Checkbox
                label="View all"
                checked={viewAll}
                onChange={(e) => {
                  onViewAll?.(e?.target?.checked);
                  dispatch(setUiState(e?.target?.checked));
                }}
              />
            )}

            {showArchived && viewMode !== 'detail' && (
              <Checkbox
                label="Show Archived"
                onChange={(e) => onShowArchived?.(e)}
              />
            )}
            {header ?? ''}
            {showExport !== false && viewMode !== 'detail' && (
              <Menu>
                <Menu.Target>
                  <Stack>
                    <Button
                      className="shadow-none flex items-center space-x-2 rounded dark:bg-dark_primary"
                      bg={'primary.4'}
                      leftSection={<IconFileExport />}
                    >
                      <span>Export</span>
                    </Button>
                  </Stack>
                </Menu.Target>
                <Menu.Dropdown>
                  {exportDropdown.map((item, index) => {
                    return (
                      <Menu.Item key={index} onClick={item.onClick}>
                        {item.key}
                      </Menu.Item>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            )}
          </div>
        </div>
        <div
          className={`border bg-white  rounded p-2 py-6 w-full ${
            viewMode !== 'detail'
              ? showExport !== false
                ? 'h-10 flex items-center justify-between'
                : 'h-10 flex w-full items-center justify-end'
              : 'flex-col space-y-2'
          }`}
        >
          {showNewButton && !showNewModal ? (
            <div
              className={`h-full flex items-center ${
                showNewButton === false ? 'invisible' : 'visible'
              }`}
            >
              <Link href={`${setting?.rootUrl}/new`}>
                <Button
                  className="bg-[#022A53] hover:bg-[#033C73] active:bg-[#011E36] shadow-none rounded flex items-center justify-center"
                  leftSection={<IconPlus />}
                >
                  <span>{newButtonText ?? 'New'}</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div
              className={`h-full flex items-center ${
                showNewModal === false ? 'invisible' : 'visible'
              }`}
            >
              <div>
                <Button
                  // className="bg-blue-500 shadow-none rounded flex  items-center justify-center"
                  bg={'primary.4'}
                  //
                  //
                  leftSection={<IconPlus />}
                  onClick={handleNewModal}
                >
                  <span>{newButtonText ?? 'New'}</span>
                </Button>
              </div>
            </div>
          )}

          {hasGenerateButton && checkedItems.length > 0 && (
            <div className="flex space-x-2">
              <Button
                onClick={() =>
                  onGenerateButton && onGenerateButton(checkedItems)
                }
              >
                Generate
              </Button>
            </div>
          )}

          <div className="flex space-x-2 justify-end">
            <TextInput
              placeholder="Search here"
              className={`${viewMode !== 'detail' ? 'w-80' : 'w-full'}`}
              onKeyUp={debounce((event: any) => {
                onSearch?.(event.target.value);
              }, 1000)}
            />
            {setting?.filter && filterMenus !== undefined && (
              <>
                <Checkbox.Group
                  value={filterValue}
                  onChange={(data: any) => {
                    setFilterValue(data);
                  }}
                >
                  <Menu>
                    <Menu.Target>
                      <Button
                        variant="filled"
                        // className={`shadow-none bg-primary-500 flex items-center  dark:border-none dark:text-white`}
                        className={`shadow-none flex items-center  dark:border-none dark:text-white`}
                        bg={'primary.4'}
                      >
                        <span>
                          <IconFilter />
                        </span>
                        <span
                          className={`${
                            viewMode === 'detail' && 'hidden'
                          } dark:text-white`}
                        >
                          Filter
                        </span>
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {filterMenus?.items?.map((menu: any, index: any) =>
                        menu?.type === 'divider' ? (
                          <Menu.Item key={index} value={menu?.value}>
                            <Divider size={'xs'} />
                          </Menu.Item>
                        ) : (
                          <Menu.Item key={index} value={menu?.value}>
                            {menu?.label}
                          </Menu.Item>
                        ),
                      )}
                    </Menu.Dropdown>
                  </Menu>
                </Checkbox.Group>
              </>
            )}
            {showSelector && (
              <Tooltip label="Selector">
                <Checkbox
                  className={`w-8 h-8 border flex pt-1 justify-center rounded ${
                    check && 'bg-blue-900'
                  }`}
                  checked={check}
                  onChange={() => {
                    if (check) {
                      setAllChecked(false);
                      setCheck(!check);
                    } else {
                      setCheck(!check);
                    }
                  }}
                />
              </Tooltip>
            )}
          </div>
        </div>
        <div className="px-2 bg-white border rounded overflow-x-auto relative">
          {itemsLoading && (
            <div className="w-full h-40 flex items-center justify-center">
              <Loader />
            </div>
          )}
          {!itemsLoading && (
            <Table highlightOnHover>
              <Table.Thead className="capitalize">
                <Table.Tr>
                  {check &&
                    (viewMode !== 'detail' ? (
                      <Table.Th scope="col" className="py-3 px-2">
                        <Checkbox onChange={() => setAllChecked(!allChecked)} />
                      </Table.Th>
                    ) : (
                      <Table.Th
                      >
                        <Checkbox onChange={() => setAllChecked(!allChecked)} />
                      </Table.Th>
                    ))}
                  {viewMode !== 'detail' ? (
                    setting?.visibleColumn?.map(
                      (item: any) =>
                        item?.hide !== true && (
                          <Table.Th
                            key={item?.name}
                            scope="col"
                            className="py-3 text-sm px-2 items-center"
                          >
                            <div className="flex items-center space-x-2 h-full">
                              <div className="flex items-center text-sm">
                                {item?.name}
                              </div>
                              {!item.hideSort && (
                                <div
                                  className="flex-col"
                                  onClick={() => {
                                    if (order.direction === 'asc') {
                                      setOrder({
                                        field: `${item.key}`,
                                        direction: 'desc',
                                      });
                                      onOrder?.({
                                        field: !Array.isArray(item.key)
                                          ? `${item.key}`
                                          : item.key && item.key?.join('.'),
                                        direction: 'desc',
                                      });
                                    } else {
                                      setOrder({
                                        field: `${item.key}`,
                                        direction: 'asc',
                                      });
                                      onOrder?.({
                                        field: !Array.isArray(item.key)
                                          ? `${item.key}`
                                          : item.key && item.key?.join('.'),
                                        direction: 'asc',
                                      });
                                    }
                                  }}
                                >
                                  <IconCaretUpFilled
                                    size={10}
                                    className={` fill-current cursor-pointer ${
                                      order.field === item.key &&
                                      order.direction === 'asc' &&
                                      'text-gray-900'
                                    }`}
                                  />

                                  <IconCaretDownFilled
                                    size={10}
                                    className={`fill-current cursor-pointer ${
                                      order.field === item.key &&
                                      order.direction === 'desc' &&
                                      'text-gray-900'
                                    }`}
                                  />
                                </div>
                              )}
                            </div>
                          </Table.Th>
                        ),
                    )
                  ) : (
                    <Table.Th>
                      <div className="flex space-x-2 items-center">
                        <div className="flex items-center text-sm">
                          {setting?.primaryColumn['name']}
                        </div>
                        <div
                          className="flex-col "
                          onClick={() => {
                            if (order.direction === 'asc') {
                              setOrder({
                                field: `${setting?.primaryColumn?.['key']}`,
                                direction: 'desc',
                              });
                              onOrder?.({
                                field: `${setting?.primaryColumn?.['key']}`,
                                direction: 'desc',
                              });
                            } else {
                              setOrder({
                                field: `${setting?.primaryColumn?.['key']}`,
                                direction: 'asc',
                              });
                              onOrder?.({
                                field: `${setting?.primaryColumn?.['key']}`,
                                direction: 'asc',
                              });
                            }
                          }}
                        >
                          <div className="h-2">
                            <IconCaretUpFilled
                              size={5}
                              className={`fill-current cursor-pointer ${
                                order.field ===
                                  setting?.primaryColumn?.['key'] &&
                                order.direction === 'asc' &&
                                'text-orange-500'
                              }`}
                            />
                          </div>
                          <div className="h-2">
                            <IconCaretDownFilled
                              size={5}
                              className={`h-2 fill-current cursor-pointer ${
                                order.field ===
                                  setting?.primaryColumn?.['key'] &&
                                order.direction === 'desc' &&
                                'text-orange-500'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </Table.Th>
                  )}
                  {viewMode !== 'detail' &&
                    (setting?.showDetail || setting?.actions) && <Table.Th></Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items?.map((item, idx) => (
                  <Table.Tr
                    onDoubleClick={() => {
                      if (setting?.showDetail) {
                        onDetail?.(item);
                        navigate.push(
                          `${setting?.rootUrl}/${setting?.detailUrl}/${
                            !Array.isArray(setting?.identity)
                              ? item[`${setting?.identity}`]
                              : setting?.identity &&
                                childeView(item, setting?.identity)
                          }`,
                        );
                      }
                    }}
                    key={idx}
                    className={`group ${
                      checkedItems.some(
                        (checkedItem) =>
                          checkedItem?.[`${setting?.identity}`] ===
                          (!Array.isArray(setting?.identity)
                            ? item?.[`${setting?.identity}`]
                            : setting?.identity &&
                              childeView(item, setting?.identity)),
                      ) && 'bg-secondary'
                    } ${
                      viewMode === 'detail'
                        ? params?.id ==
                          (!Array.isArray(setting?.identity)
                            ? item?.[`${setting?.identity}`]
                            : setting?.identity &&
                              childeView(item, setting?.identity))
                          ? 'bg-primary-500  text-white hover:bg-primary-500'
                          : `${
                              checkedItems.some(
                                (checkedItem) =>
                                  checkedItem.id ===
                                  (!Array.isArray(setting?.identity)
                                    ? item?.[`${setting?.identity}`]
                                    : setting?.identity &&
                                      childeView(item, setting?.identity)),
                              )
                                ? 'bg-secondary  text-white'
                                : 'bg-white'
                            }  `
                        : ''
                    }  border-b  hover:bg-primary-50 `}
                  >
                    {check && (
                      <td
                        className={`${
                          viewMode === 'detail' &&
                          'group-hover:bg-primary-500 group-hover:text-white font-medium  whitespace-nowrap'
                        } py-2 px-2`}
                      >
                        <Checkbox
                          value={JSON.stringify(item)}
                          checked={
                            (allChecked ||
                              checkedItems.some((checkedItem: any) =>
                                !Array.isArray(setting?.identity)
                                  ? checkedItem?.[`${setting?.identity}`]
                                  : setting?.identity &&
                                      childeView(
                                        checkedItem,
                                        setting?.identity,
                                      ) === !Array.isArray(setting?.identity)
                                    ? item?.[`${setting?.identity}`]
                                    : setting?.identity &&
                                      childeView(item, setting?.identity),
                              )) &&
                            checkedItems.some(
                              (checkedItem: any) =>
                                (!Array.isArray(setting?.identity)
                                  ? checkedItem[`${setting?.identity}`]
                                  : setting?.identity &&
                                    childeView(
                                      checkedItem,
                                      setting?.identity,
                                    )) ===
                                (!Array.isArray(setting?.identity)
                                  ? item?.[`${setting?.identity}`]
                                  : setting?.identity &&
                                    childeView(item, setting?.identity)),
                            ) &&
                            true
                          }
                          onChange={(event: any) => {
                            checkedItems.some(
                              (checkedItem) =>
                                (!Array.isArray(setting?.identity)
                                  ? checkedItem[`${setting?.identity}`]
                                  : setting?.identity &&
                                    childeView(
                                      checkedItem,
                                      setting?.identity,
                                    )) ===
                                (!Array.isArray(setting?.identity)
                                  ? JSON.parse(event.target.value)?.[
                                      `${setting?.identity}`
                                    ]
                                  : setting?.identity &&
                                    childeView(
                                      JSON.parse(event.target.value),
                                      setting?.identity,
                                    )),
                            )
                              ? setCheckedItems([
                                  ...checkedItems.filter(
                                    (checkedItem) =>
                                      (!Array.isArray(setting?.identity)
                                        ? checkedItem[`${setting?.identity}`]
                                        : setting?.identity &&
                                          childeView(
                                            checkedItem,
                                            setting?.identity,
                                          )) !==
                                      (!Array.isArray(setting?.identity)
                                        ? JSON.parse(event.target.value)?.[
                                            `${setting?.identity}`
                                          ]
                                        : setting?.identity &&
                                          childeView(
                                            JSON.parse(event.target.value),
                                            setting?.identity,
                                          )),
                                  ),
                                ])
                              : setCheckedItems([
                                  ...checkedItems,
                                  JSON.parse(event.target.value),
                                ]);
                          }}
                        />
                      </td>
                    )}
                    {viewMode !== 'detail' ? (
                      setting?.visibleColumn?.map(
                        (col: any, index: any) =>
                          col.hide !== true && (
                            <td key={index} className="py-2 px-2">
                              {col.render ? (
                                <>{col.render(item)}</>
                              ) : !Array.isArray(col.key) ? (
                                typeof item?.[`${col.key}`] === 'boolean' ? (
                                  item?.[`${col.key}`] ? (
                                    <IconCheck size={20} />
                                  ) : (
                                    <IconMinus size={20} />
                                  )
                                ) : col.isDate ? (
                                  item?.[`${col.key}`] ? (
                                    dateFormat(
                                      item?.[`${col.key}`],
                                      'mmm dS, yyyy',
                                    )
                                  ) : (
                                    ''
                                  )
                                ) : (
                                  item?.[`${col.key}`]
                                )
                              ) : typeof childeView(item, col.key) ===
                                'boolean' ? (
                                childeView(item, col.key) ? (
                                  <IconCheck size={20} />
                                ) : (
                                  <IconMinus size={20} />
                                )
                              ) : col.isDate ? (
                                childeView(item, col.key) ? (
                                  dateFormat(
                                    childeView(item, col.key),
                                    'mmm dS, yyyy ',
                                  )
                                ) : (
                                  ''
                                )
                              ) : (
                                childeView(item, col.key)
                              )}
                            </td>
                          ),
                      )
                    ) : (
                      <Table.Th
                        className={`py-2 ${
                          pathname ===
                          `${setting?.detailUrl}/${
                            !Array.isArray(setting?.identity)
                              ? item?.[`${setting?.identity}`]
                              : setting?.identity &&
                                childeView(item, setting?.identity)
                          }`
                            ? 'bg-primary-500 text-white'
                            : ''
                        } cursor-pointer group-hover:bg-primary-500 group-hover:text-white w-full px-2 font-medium  whitespace-nowrap `}
                        onClick={() => {
                          onDetail?.(item);
                          navigate.push(
                            `${setting?.rootUrl}/${setting?.detailUrl}/${
                              !Array.isArray(setting?.identity)
                                ? item?.[`${setting?.identity}`]
                                : setting?.identity &&
                                  childeView(item, setting?.identity)
                            }`,
                          );
                        }}
                      >
                        {setting?.primaryColumn?.render ? (
                          <>{setting?.primaryColumn?.render(item)}</>
                        ) : !Array.isArray(setting?.primaryColumn?.key) ? (
                          item?.[`${setting?.primaryColumn?.key}`]
                        ) : (
                          setting?.primaryColumn &&
                          childeView(item, setting?.primaryColumn?.key)
                        )}
                      </Table.Th>
                    )}
                    {viewMode !== 'detail' && setting?.showDetail && (
                      <td
                        onClick={() => {
                          onDetail?.(item);
                          navigate.push(
                            `${setting.rootUrl}/${setting?.detailUrl}/${
                              !Array.isArray(setting?.identity)
                                ? item?.[`${setting?.identity}`]
                                : setting?.identity &&
                                  childeView(item, setting?.identity)
                            }`,
                          );
                        }}
                        className="py-2 px-2 cursor-pointer "
                      >
                        <IconChevronRight className="group-hover:visible invisible" />
                      </td>
                    )}
                    {viewMode !== 'detail' && !setting?.showDetail && (
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <Button variant="subtle" size="xs" px={6}>
                            <IconDotsVertical size={16} />
                          </Button>
                        </Menu.Target>

                        <Menu.Dropdown>
                          {Array.isArray(setting?.actions) &&
                            setting.actions.map((action) => {
                              const IconComponent = TablerIcons[
                                action.icon as keyof typeof TablerIcons
                              ] as Icon;

                              return (
                                <React.Fragment key={action.key}>
                                  <Menu.Item
                                    leftSection={
                                      IconComponent ? (
                                        <IconComponent size={16} />
                                      ) : null
                                    }
                                    color={
                                      action.type === 'danger'
                                        ? 'red'
                                        : undefined
                                    }
                                    onClick={() =>
                                      handleAction && handleAction(action, item)
                                    }
                                  >
                                    {action.label}
                                  </Menu.Item>

                                  {action.divider && <Menu.Divider />}
                                </React.Fragment>
                              );
                            })}
                        </Menu.Dropdown>
                      </Menu>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
          {total > 0 && (
            <Flex m={'lg'} justify={'space-between'}>
              {
                <Group>
                  <Select
                    size="xs"
                    defaultValue={props.defaultPageSize?.toString() ?? '20'}
                    value={pageSize.toString()}
                    data={PaginationOptions}
                    onChange={(value: string | null, option: ComboboxItem) => {
                      const newSize = parseInt(value ?? '20');
                      setPageSize(newSize);
                      setPageIndex(1); // Reset to first page when changing page size
                      onPaginationChange(1, newSize);
                    }}
                  />
                  {showTotal && (
                    <span className="text-sm text-gray-500">
                      {` Total : ${Math.ceil(total)} ${title}`}
                    </span>
                  )}
                </Group>
              }
              <Pagination
                size={'xs'}
                total={Math.ceil(total / pageSize)}
                value={pageIndex}
                onChange={(value: number) => {
                  setPageIndex(value);
                  onPaginationChange(value, pageSize);
                }}
              />
            </Flex>
          )}
          {!items?.length ? (
            <div className="w-full relative flex justify-center items-center h-56">
              {<EmptyIcon />}
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      {/* detail  view */}
      <div
        className={` ${viewMode === 'detail' ? 'block' : 'hidden'} ${
          fullScreen ? 'w-full -px-4' : detailWidth.content
        } flex-col space-y-2 px-2 h-full`}
      >
        <div className="h-14 bg-white rounded p-2 border   flex justify-between items-center">
          <div className="h-full  items-center flex text-sm font-semibold">
            {detailTitle ?? title}
          </div>
          <div className="h-full items-center flex space-x-2">
            <span onClick={() => setFullScreen(!fullScreen)}>
              {fullScreen ? (
                <Tooltip label="Minimize">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="fill-current h-5"
                    viewBox="0 0 32 32"
                  >
                    <path d="M4.71875 3.28125L3.28125 4.71875L10.5625 12L5 12L5 14L14 14L14 5L12 5L12 10.5625 Z M 27.28125 3.28125L20 10.5625L20 5L18 5L18 14L27 14L27 12L21.4375 12L28.71875 4.71875 Z M 5 18L5 20L10.5625 20L3.28125 27.28125L4.71875 28.71875L12 21.4375L12 27L14 27L14 18 Z M 18 18L18 27L20 27L20 21.4375L27.28125 28.71875L28.71875 27.28125L21.4375 20L27 20L27 18Z" />
                  </svg>
                </Tooltip>
              ) : (
                <Tooltip label="Maximize">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="fill-current h-5"
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                  >
                    <path d="M7.484375 5.984375 A 1.50015 1.50015 0 0 0 6 7.6914062L6 15.5 A 1.50015 1.50015 0 1 0 9 15.5L9 11.121094L16.439453 18.560547 A 1.50015 1.50015 0 1 0 18.560547 16.439453L11.121094 9L15.5 9 A 1.50015 1.50015 0 1 0 15.5 6L7.6894531 6 A 1.50015 1.50015 0 0 0 7.484375 5.984375 z M 40.470703 5.9863281 A 1.50015 1.50015 0 0 0 40.308594 6L32.5 6 A 1.50015 1.50015 0 1 0 32.5 9L36.878906 9L29.439453 16.439453 A 1.50015 1.50015 0 1 0 31.560547 18.560547L39 11.121094L39 15.5 A 1.50015 1.50015 0 1 0 42 15.5L42 7.6894531 A 1.50015 1.50015 0 0 0 40.470703 5.9863281 z M 30.484375 28.984375 A 1.50015 1.50015 0 0 0 29.439453 31.560547L36.878906 39L32.5 39 A 1.50015 1.50015 0 1 0 32.5 42L40.310547 42 A 1.50015 1.50015 0 0 0 42 40.308594L42 32.5 A 1.50015 1.50015 0 1 0 39 32.5L39 36.878906L31.560547 29.439453 A 1.50015 1.50015 0 0 0 30.484375 28.984375 z M 17.470703 28.986328 A 1.50015 1.50015 0 0 0 16.439453 29.439453L9 36.878906L9 32.5 A 1.50015 1.50015 0 1 0 6 32.5L6 40.310547 A 1.50015 1.50015 0 0 0 7.6914062 42L15.5 42 A 1.50015 1.50015 0 1 0 15.5 39L11.121094 39L18.560547 31.560547 A 1.50015 1.50015 0 0 0 17.470703 28.986328 z" />
                  </svg>
                </Tooltip>
              )}
            </span>
            <Tooltip label="Close">
              <span
                onClick={() => {
                  navigate.push(setting?.rootUrl ?? '');
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 fill-current"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.5 2C2.675781 2 2 2.675781 2 3.5L2 12.5C2 13.324219 2.675781 14 3.5 14L12.5 14C13.324219 14 14 13.324219 14 12.5L14 3.5C14 2.675781 13.324219 2 12.5 2 Z M 3.5 3L12.5 3C12.78125 3 13 3.21875 13 3.5L13 12.5C13 12.78125 12.78125 13 12.5 13L3.5 13C3.21875 13 3 12.78125 3 12.5L3 3.5C3 3.21875 3.21875 3 3.5 3 Z M 5.726563 5.023438L5.023438 5.726563L7.292969 8L5.023438 10.269531L5.726563 10.980469L8 8.707031L10.269531 10.980469L10.980469 10.269531L8.707031 8L10.980469 5.726563L10.269531 5.023438L8 7.292969Z" />
                </svg>
              </span>
            </Tooltip>
          </div>
        </div>
        <div className="h-full bg-white rounded flex space-x-2">{detail}</div>
      </div>

      {/* Print modal */}
      <Modal
        title="Print"
        centered
        opened={opened}
        className="w-full"
        onClose={close}
      >
        <div className="px-2">
          <Table
           highlightOnHover
          >
            <Table.Thead>
              <Table.Tr>
                {setting?.visibleColumn?.map(
                  (item: any) =>
                    item?.print !== false && (
                      <Table.Th key={item.name}>
                      </Table.Th>
                    ),
                )}
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {printItems?.map((item, idx) => (
                <Table.Tr
                  key={idx}
                  className={`group ${
                    viewMode === 'detail'
                      ? params?.id ===
                        item[
                          `${
                            !Array.isArray(setting?.identity)
                              ? setting?.identity
                              : setting?.identity &&
                                childeView(item, setting?.identity)
                          }`
                        ]
                        ? 'bg-primary-500 dark:bg-primary-500 text-white'
                        : 'bg-white dark:bg-gray-700 '
                      : ''
                  } border-b dark:border-gray-700 `}
                >
                  {setting?.visibleColumn.map((col: any, index: any) => (
                    <td key={index} className="py-2 px-2">
                      {col.render && col?.print !== false ? (
                        <>{col.render(item)}</>
                      ) : !Array.isArray(col.key) ? (
                        typeof item[`${col.key}`] === 'boolean' ? (
                          item[`${col.key}`] ? (
                            <IconCheck />
                          ) : (
                            <IconDots />
                          )
                        ) : col.isDate ? (
                          item[`${col.key}`] ? (
                            dateFormat(item[`${col.key}`], 'mmm dS, yyyy ')
                          ) : (
                            ''
                          )
                        ) : (
                          item[`${col.key}`]
                        )
                      ) : typeof childeView(item, col.key) === 'boolean' ? (
                        childeView(item, col.key) ? (
                          <IconCheck />
                        ) : (
                          <IconDots />
                        )
                      ) : col.isDate ? (
                        childeView(item, col.key) ? (
                          dateFormat(childeView(item, col.key), 'mmm dS, yyyy ')
                        ) : (
                          ''
                        )
                      ) : (
                        childeView(item, col.key)
                      )}
                    </td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <div className="w-full flex justify-end items-center mt-4">
            <ReactToPrint
              trigger={() => (
                <Button
                  size="sm"
                  className="flex  items-center space-x-2 bg-primary-500 text-white"
                  leftSection={<IconPrinter />}
                >
                  <span className="text-sm">Print</span>
                </Button>
              )}
              content={() => pdfRef.current}
            />
          </div>
        </div>
      </Modal>
      {/* <Modal
          size={"100%"}
          opened={opened && printItems.length > 0}
          onClose={() => setOpened(false)}
          title={title}
          closeOnClickOutside
        >
          <div className="px-2">
            <table
              ref={pdfRef}
              className="w-full text-sm text-left text-gray-500 dark:text-gray-400"
            >
              <Table.Thead className="text-sm text-gray-700 capitalize bg-gray-50 dark:bg-gray-500 dark:text-gray-400">
                <tr>
                  {setting?.visibleColumn?.map(
                    (item) =>
                      item?.print !== false && (
                        <th key={item.name} scope="col" className="py-3 px-2">
                          <div className="flex space-x-2 h-full">
                            <div className="flex items-center ">{item.name}</div>
                          </div>
                        </th>
                      )
                  )}
                  <th></th>
                </tr>
              </Table.Thead>
              <tbody>
                {printItems?.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`group ${
                      viewMode==='detail'
                        ? params?.id ===
                          item[
                            `${
                              !Array.isArray(setting?.identity)
                                ? setting?.identity
                                : setting?.identity &&
                                  childeView(item, setting?.identity)
                            }`
                          ]
                          ? "bg-primary-500 dark:bg-primary-500 text-white"
                          : "bg-white dark:bg-gray-700 "
                        : ""
                    }  border-b dark:border-gray-700 `}
                  >
                    {setting?.visibleColumn.map((col, index) => (
                      <td key={index} className="py-2 px-2">
                        {col.render && col?.print !== false ? (
                          <>{col.render(item)}</>
                        ) : !Array.isArray(col.key) ? (
                          typeof item[`${col.key}`] === "boolean" ? (
                            item[`${col.key}`] ? (
                              <IconCheck size={20} />
                            ) : (
                              <IconLineDashed size={20} />
                            )
                          ) : col.isDate ? (
                            dateFormat(
                              item[`${col.key}`],
                              "mmm dS, yyyy "
                            )
                          ) : (
                            item[`${col.key}`]
                          )
                        ) : typeof childeView(item, col.key) === "boolean" ? (
                          childeView(item, col.key) ? (
                            <IconCheck size={20} />
                          ) : (
                            <IconLineDashed size={20} />
                          )
                        ) : col.isDate ? (
                          dateFormat(
                            childeView(item, col.key),
                            "mmm dS, yyyy "
                          )
                        ) : (
                          childeView(item, col.key)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="w-full flex justify-end items-center mt-4">
            <ReactToPrint
              trigger={() => (
                <Button
                  variant="default"
                  size="xs"
                  className="flex  items-center space-x-4 bg-primary-500 text-white"
                >
                  <IconPrinter size={14} /> <span className="text-xs">Print</span>
                </Button>
              )}
              content={() => pdfRef.current}
            />
          </div>
        </Modal> */}
    </div>
  );
}

export const visibleColumn = (tableColumns, primaryContent, mode = 'list') => {
  const column = tableColumns.reduce((obj, c) => {
    obj[c.id] = mode === 'list';
    return obj;
  }, {});

  return { ...column, select: true, action: true, [primaryContent]: true };
};

function update(table) {
  const clauses = {
    set: { columns: [], values: [] },
    where: { columns: [], values: [] },
  }

  function set(column, value) {
    clauses.set.columns.push(`${column} = ?`);
    clauses.set.values.push(value);
    return { set, where, build };
  }

  function where(column, value) {
    clauses.where.columns.push(`${column} = ?`);
    clauses.where.values.push(value);
    return { set, where, build };
  }

  function build() {
    if (!table || clauses.set.columns.length === 0) {
      return [null, null];
    }
    const query = `
      UPDATE ${table}
      SET ${clauses.set.columns.join(', ')}
      ${clauses.where.columns.length > 0 ? `WHERE ${clauses.where.columns.join(' AND ')}` : ''}
    `;
    const values = [].concat(clauses.set.values, clauses.where.values);
    return [query, values];
  };

  return { set, where, build };
}

module.exports = {
  update,
};

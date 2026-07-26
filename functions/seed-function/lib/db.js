const catalyst = require('zcatalyst-sdk-node');

function getDatastore(app) {
  return app.datastore();
}

async function executeQuery(app, sql, params = []) {
  let finalSql = sql;
  params.forEach((param, i) => {
    const safe = typeof param === 'string' ? `'${param.replace(/'/g, "''")}'` : param;
    finalSql = finalSql.replace('?', safe);
  });
  const datastore = getDatastore(app);
  const result = await datastore.executeQuery(finalSql);
  return result;
}

async function batchInsert(app, table, rows) {
  if (!Array.isArray(rows) || rows.length === 0) return;
  const columns = Object.keys(rows[0]);
  const valuesList = rows.map(row => {
    const vals = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
      return val;
    });
    return `(${vals.join(',')})`;
  });
  const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${valuesList.join(',')}`;
  const datastore = getDatastore(app);
  await datastore.executeQuery(sql);
}

module.exports = { executeQuery, getDatastore, batchInsert };

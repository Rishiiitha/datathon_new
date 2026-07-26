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

module.exports = { executeQuery, getDatastore };

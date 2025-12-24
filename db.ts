import { ZenStackClient } from '@zenstackhq/orm';
import { SqlJsDialect } from '@zenstackhq/orm/dialects/sql.js';
import { sql } from '@zenstackhq/orm/helpers';
import initSqlJs from 'sql.js';
import { schema } from './zenstack/schema';

export async function createClient() {
  // initialize sql.js engine
  const SQL = await initSqlJs();

  // create database client with sql.js dialect
  const db = new ZenStackClient(schema, {
    dialect: new SqlJsDialect({ sqlJs: new SQL.Database() }),
    computedFields: {
      User: {
        // equivalent SQL:
        // `(SELECT COUNT(*) AS "count" FROM "Post" WHERE "Post"."authorId" = "User"."id")
        postCount: (eb, { modelAlias }) =>
          eb.selectFrom('Post')
            .whereRef('Post.authorId', '=', sql.ref(`${modelAlias}.id`))
            .select(({fn}) => fn.countAll<number>().as('count'))
      }
    }
  });

  // push schema to the database
  // the `$pushSchema` API is for testing purposes only
  await db.$pushSchema();

  return db;
}

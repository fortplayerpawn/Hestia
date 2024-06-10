import { Pool, type QueryResult } from "pg";
import { config, logger } from "..";

interface DatabaseConfig {
  connectionString?: string;
  ssl?: boolean;
  connectionPoolSize?: number;
}

export default class Database {
  private pool: Pool;

  constructor(private dbConfig: DatabaseConfig = {}) {
    const {
      connectionString = config.databaseUrl || "",
      ssl = false,
      connectionPoolSize = 10,
    } = dbConfig;

    this.pool = new Pool({
      connectionString,
      ssl: ssl ? { rejectUnauthorized: false } : false,
      max: connectionPoolSize,
      idleTimeoutMillis: 10000, // Close idle clients after 10 seconds
      connectionTimeoutMillis: 2000, // Wait for 2 seconds for a new client connection
    });
  }

  public async query(text: string, params?: any[]): Promise<QueryResult<any>> {
    const start = performance.now();
    try {
      const response = await this.pool.query(text, params);
      const duration = performance.now() - start;

      return response;
    } catch (error) {
      logger.error(`Failed to query: ${error}`);
      throw error;
    }
  }

  private async checkExtensionExists(extensionName: string): Promise<boolean> {
    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM pg_extension
        WHERE extname = $1
      )
    `;
    const result = await this.query(query, [extensionName]);
    return result.rows[0].exists;
  }

  public async connect() {
    try {
      await this.pool.connect();
      logger.startup("Connected to Database.");

      const extensionExists = await this.checkExtensionExists("uuid-ossp");
      if (!extensionExists) {
        await this.query("CREATE EXTENSION 'uuid-ossp'");
        logger.info("Created 'uuid-ossp' extension.");
      } else logger.warn("Extension 'uuid-ossp' already exists.");
    } catch (error) {
      logger.error(`Error connecting to database: ${error}`);
    }
  }

  public async disconnect() {
    try {
      await this.pool.end();
      logger.startup("Disconnected from Database.");
    } catch (error) {
      logger.error(`Error disconnecting from database: ${error}`);
    }
  }

  private async tableExists(tableName: string): Promise<boolean> {
    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = $1
      )
    `;
    const result = await this.query(query, [tableName]);
    return result.rows[0].exists;
  }

  public async createTables(): Promise<void> {
    const tableName = "servers";

    // Check if the table already exists
    const exists = await this.tableExists(tableName);
    if (exists) {
      return void logger.warn(`Table '${tableName}' already exists.`);
    }

    const createServersTableQuery = `
      CREATE TABLE servers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        region VARCHAR(255) NOT NULL,
        playlist VARCHAR(255) NOT NULL,
        status VARCHAR(255) NOT NULL,
        maxplayers INT NOT NULL,
        players INT NOT NULL,
        season INT NOT NULL,
        customkey VARCHAR(255),
        ip VARCHAR(255) NOT NULL,
        port INT NOT NULL
      )
    `;

    try {
      await this.query(createServersTableQuery);

      logger.info("Created tables successfully.");
    } catch (error) {
      logger.error(`Failed to create table: ${error}`);
    }
  }
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sql')({
  component: SQLLearningPlatform,
})
import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  addEdge, 
  useNodesState, 
  useEdgesState,
  Handle,
  Position 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Database, Play, Plus, Trash2, X, AlertCircle, BookOpen, Trophy, RefreshCw, Code, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

// ==================== SQL ENGINE ====================
class SimpleDB {
  constructor() {
    this.tables = {};
  }

  run(sql) {
    const normalized = sql.trim().toLowerCase();
    
    if (normalized.startsWith('create table')) {
      const match = sql.match(/create table (\w+)/i);
      if (match) {
        const tableName = match[1].toLowerCase();
        this.tables[tableName] = [];
      }
    } else if (normalized.startsWith('drop table')) {
      const match = sql.match(/drop table(?: if exists)? (\w+)/i);
      if (match) {
        delete this.tables[match[1].toLowerCase()];
      }
    } else if (normalized.startsWith('delete from')) {
      const match = sql.match(/delete from (\w+)/i);
      if (match) {
        this.tables[match[1].toLowerCase()] = [];
      }
    } else if (normalized.startsWith('insert into')) {
      const tableMatch = sql.match(/insert into (\w+)/i);
      const tableName = tableMatch[1].toLowerCase();
      
      const valuesMatch = sql.match(/values\s*\((.*?)\)/i);
      if (valuesMatch && this.tables[tableName]) {
        const values = valuesMatch[1].split(',').map(v => {
          v = v.trim();
          if (v.startsWith("'") && v.endsWith("'")) {
            return v.slice(1, -1);
          }
          return isNaN(v) ? v : Number(v);
        });
        this.tables[tableName].push(values);
      }
    }
  }

  exec(sql) {
    const normalized = sql.trim().toLowerCase();
    
    if (normalized.startsWith('select')) {
      const fromMatch = sql.match(/from\s+(\w+)/i);
      if (!fromMatch) return [];
      
      const tableName = fromMatch[1].toLowerCase();
      const table = this.tables[tableName] || [];
      
      let filteredData = [...table];
      const whereMatch = sql.match(/where\s+(.+?)(?:$|order|limit|group)/i);
      if (whereMatch) {
        const condition = whereMatch[1].trim();
        filteredData = this.filterData(filteredData, condition);
      }
      
      if (normalized.includes('count(*)')) {
        return [{
          columns: ['COUNT(*)'],
          values: [[filteredData.length]]
        }];
      }
      
      if (normalized.includes('group by')) {
        const groupMatch = sql.match(/group by\s+(\w+)/i);
        if (groupMatch && normalized.includes('count(*)')) {
          const groupCol = groupMatch[1].toLowerCase();
          const colIndex = this.getColumnIndex(tableName, groupCol);
          
          const grouped = {};
          filteredData.forEach(row => {
            const key = row[colIndex];
            grouped[key] = (grouped[key] || 0) + 1;
          });
          
          return [{
            columns: [groupCol, 'COUNT(*)'],
            values: Object.entries(grouped).map(([k, v]) => [k, v])
          }];
        }
      }
      
      const columns = this.getTableColumns(tableName);
      
      return [{
        columns: columns,
        values: filteredData
      }];
    }
    
    return [];
  }

  execRawQuery(sql) {
    return this.exec(sql);
  }

  filterData(data, condition) {
    if (condition.includes('like')) {
      const match = condition.match(/(\w+)\s+like\s+'([^']+)'/i);
      if (match) {
        const pattern = match[2].replace(/%/g, '.*');
        const regex = new RegExp(pattern, 'i');
        
        return data.filter(row => {
          return row.some(cell => regex.test(String(cell)));
        });
      }
    }
    
    if (condition.includes('=')) {
      const match = condition.match(/(\w+)\s*=\s*'([^']+)'/i);
      if (match) {
        const value = match[2];
        return data.filter(row => {
          return row.some(cell => String(cell) === value);
        });
      }
      
      const numMatch = condition.match(/(\w+)\s*=\s*(\d+)/i);
      if (numMatch) {
        const value = Number(numMatch[2]);
        return data.filter(row => row[0] === value);
      }
    }
    
    if (condition.includes('>')) {
      const match = condition.match(/(\w+)\s*>\s*(\d+(?:\.\d+)?)/i);
      if (match) {
        const threshold = Number(match[2]);
        return data.filter(row => {
          const value = row[row.length - 1];
          return Number(value) > threshold;
        });
      }
    }
    
    return data;
  }

  getTableColumns(tableName) {
    if (tableName === 'customers') {
      return ['id', 'name', 'email', 'phone', 'registration_date'];
    } else if (tableName === 'products') {
      return ['id', 'name', 'price', 'category', 'stock_quantity'];
    } else if (tableName === 'orders') {
      return ['id', 'customer_id', 'order_date', 'status', 'total_amount'];
    } else if (tableName === 'order_items') {
      return ['id', 'order_id', 'product_id', 'quantity', 'price_at_purchase'];
    }
    return ['col1', 'col2', 'col3'];
  }

  getColumnIndex(tableName, columnName) {
    const cols = this.getTableColumns(tableName);
    return cols.indexOf(columnName.toLowerCase());
  }

  getTableNames() {
    return Object.keys(this.tables);
  }
}

// ==================== PROBLEM DEFINITION ====================
const PROBLEM = {
  id: 2,
  title: "Advanced E-Commerce Order Management System",
  difficulty: "Hard",
  description: "Design a complete multi-table relational database system for a modern e-commerce platform. This system must handle customers, products, orders, order items (many-to-many relationship), and inventory management with proper foreign key relationships and data integrity.",
  requirements: [
    "Create a 'customers' table with id, name, email, phone, and registration_date",
    "Create a 'products' table with id, name, price, category, and stock_quantity",
    "Create an 'orders' table with id, customer_id, order_date, status, and total_amount",
    "Create an 'order_items' table with id, order_id, product_id, quantity, and price_at_purchase",
    "Establish proper foreign key relationships: orders.customer_id → customers.id, order_items.order_id → orders.id, order_items.product_id → products.id",
    "Support tracking of product categories, stock levels, order statuses, and historical pricing"
  ],
  hints: [
    "Start with independent tables: customers and products (no foreign keys)",
    "Then create orders table that references customers",
    "Finally create order_items table that references both orders and products",
    "Mark all foreign keys appropriately (FK)",
    "Use DECIMAL(10,2) for all monetary values",
    "Use INT for quantities and all id fields as Primary Keys",
    "The order_items table creates a many-to-many relationship between orders and products"
  ],
  testCases: [
    {
      name: "Schema Validation - All Tables",
      type: "schema",
      description: "Verify all four tables exist with correct structure",
      expectedTables: [
        {
          name: "customers",
          columns: ["id", "name", "email", "phone", "registration_date"]
        },
        {
          name: "products",
          columns: ["id", "name", "price", "category", "stock_quantity"]
        },
        {
          name: "orders",
          columns: ["id", "customer_id", "order_date", "status", "total_amount"]
        },
        {
          name: "order_items",
          columns: ["id", "order_id", "product_id", "quantity", "price_at_purchase"]
        }
      ],
      points: 25
    },
    {
      name: "Retrieve All Customers",
      type: "query",
      description: "SELECT * FROM customers",
      query: "SELECT * FROM customers",
      seedData: {
        customers: [
          [1, 'Alice Johnson', 'alice@gmail.com', '555-0101', '2024-01-15'],
          [2, 'Bob Smith', 'bob@yahoo.com', '555-0102', '2024-02-20'],
          [3, 'Carol White', 'carol@outlook.com', '555-0103', '2024-03-10'],
          [4, 'David Brown', 'david@gmail.com', '555-0104', '2024-03-25']
        ],
        products: [
          [1, 'Laptop Pro', 1299.99, 'Electronics', 50],
          [2, 'Wireless Mouse', 29.99, 'Electronics', 200],
          [3, 'Office Chair', 249.99, 'Furniture', 75],
          [4, 'Desk Lamp', 39.99, 'Furniture', 150],
          [5, 'USB-C Cable', 12.99, 'Electronics', 500]
        ],
        orders: [
          [1, 1, '2024-04-01', 'Completed', 1329.98],
          [2, 2, '2024-04-05', 'Processing', 279.98],
          [3, 1, '2024-04-10', 'Shipped', 52.98],
          [4, 3, '2024-04-12', 'Completed', 249.99],
          [5, 4, '2024-04-15', 'Cancelled', 0]
        ],
        order_items: [
          [1, 1, 1, 1, 1299.99],
          [2, 1, 2, 1, 29.99],
          [3, 2, 3, 1, 249.99],
          [4, 2, 2, 1, 29.99],
          [5, 3, 4, 1, 39.99],
          [6, 3, 5, 1, 12.99],
          [7, 4, 3, 1, 249.99]
        ]
      },
      expectedOutput: [
        [1, 'Alice Johnson', 'alice@gmail.com', '555-0101', '2024-01-15'],
        [2, 'Bob Smith', 'bob@yahoo.com', '555-0102', '2024-02-20'],
        [3, 'Carol White', 'carol@outlook.com', '555-0103', '2024-03-10'],
        [4, 'David Brown', 'david@gmail.com', '555-0104', '2024-03-25']
      ],
      points: 10
    },
    {
      name: "Find Electronics Products",
      type: "query",
      description: "SELECT * FROM products WHERE category = 'Electronics'",
      query: "SELECT * FROM products WHERE category = 'Electronics'",
      expectedOutput: [
        [1, 'Laptop Pro', 1299.99, 'Electronics', 50],
        [2, 'Wireless Mouse', 29.99, 'Electronics', 200],
        [5, 'USB-C Cable', 12.99, 'Electronics', 500]
      ],
      points: 10
    },
    {
      name: "Find High-Value Products",
      type: "query",
      description: "SELECT * FROM products WHERE price > 100",
      query: "SELECT * FROM products WHERE price > 100",
      expectedOutput: [
        [1, 'Laptop Pro', 1299.99, 'Electronics', 50],
        [3, 'Office Chair', 249.99, 'Furniture', 75]
      ],
      points: 10
    },
    {
      name: "Get Completed Orders",
      type: "query",
      description: "SELECT * FROM orders WHERE status = 'Completed'",
      query: "SELECT * FROM orders WHERE status = 'Completed'",
      expectedOutput: [
        [1, 1, '2024-04-01', 'Completed', 1329.98],
        [4, 3, '2024-04-12', 'Completed', 249.99]
      ],
      points: 10
    },
    {
      name: "Count Total Orders",
      type: "query",
      description: "SELECT COUNT(*) FROM orders",
      query: "SELECT COUNT(*) FROM orders",
      expectedOutput: [[5]],
      points: 10
    },
    {
      name: "Count Order Items",
      type: "query",
      description: "SELECT COUNT(*) FROM order_items",
      query: "SELECT COUNT(*) FROM order_items",
      expectedOutput: [[7]],
      points: 10
    },
    {
      name: "Find Low Stock Products",
      type: "query",
      description: "SELECT * FROM products WHERE stock_quantity < 100",
      query: "SELECT * FROM products WHERE stock_quantity < 100",
      expectedOutput: [
        [1, 'Laptop Pro', 1299.99, 'Electronics', 50],
        [3, 'Office Chair', 249.99, 'Furniture', 75]
      ],
      points: 15
    }
  ]
};

// ==================== CUSTOM TABLE NODE ====================
const TableNode = ({ data }) => {
  return (
    <div className="bg-[#1a1a1a] border-2 border-[#00d9a3] rounded-lg shadow-xl min-w-[240px] overflow-hidden">
      <div className="bg-gradient-to-r from-[#00d9a3] to-[#00b386] text-black px-4 py-3 font-bold flex items-center gap-2">
        <Database size={18} />
        <span className="text-base uppercase tracking-wide">{data.label}</span>
      </div>
      <div className="p-0 bg-[#1a1a1a]">
        {data.columns?.map((col, idx) => (
          <div key={idx} className="py-3 px-4 text-sm border-b border-[#2a2a2a] last:border-b-0 flex items-center gap-3 hover:bg-[#242424] transition-colors">
            {col.isPrimary && <span className="text-yellow-400 text-base">🔑</span>}
            {col.isForeign && <span className="text-purple-400 text-base">🔗</span>}
            <span className="font-semibold text-white">{col.name}</span>
            <span className="text-gray-500 text-xs ml-auto font-mono">({col.type})</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#00d9a3]" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#00d9a3]" />
    </div>
  );
};

const nodeTypes = {
  tableNode: TableNode,
};

// ==================== MAIN COMPONENT ====================
export default function SQLLearningPlatform() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [db] = useState(() => new SimpleDB());
  
  const [testResults, setTestResults] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  
  const [feedback, setFeedback] = useState('');
  const [showTableForm, setShowTableForm] = useState(false);
  const [showTestResults, setShowTestResults] = useState(false);
  const [newTable, setNewTable] = useState({ 
    name: '', 
    columns: [{ name: '', type: 'VARCHAR(255)', isPrimary: false, isForeign: false }] 
  });
  const [sqlGenerated, setSqlGenerated] = useState('');

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addColumn = () => {
    setNewTable({
      ...newTable,
      columns: [...newTable.columns, { name: '', type: 'VARCHAR(255)', isPrimary: false, isForeign: false }]
    });
  };

  const updateColumn = (index, field, value) => {
    const updatedColumns = [...newTable.columns];
    if (field === 'isPrimary' && value) {
      updatedColumns.forEach((col, idx) => {
        if (idx !== index) col.isPrimary = false;
      });
    }
    updatedColumns[index][field] = value;
    setNewTable({ ...newTable, columns: updatedColumns });
  };

  const removeColumn = (index) => {
    if (newTable.columns.length === 1) {
      alert('Table must have at least one column');
      return;
    }
    const updatedColumns = newTable.columns.filter((_, i) => i !== index);
    setNewTable({ ...newTable, columns: updatedColumns });
  };

  const createTable = () => {
    if (!newTable.name || !newTable.name.trim()) {
      alert('Please provide a table name');
      return;
    }

    const validColumns = newTable.columns.filter(c => c.name && c.name.trim());
    if (validColumns.length === 0) {
      alert('Please provide at least one column with a name');
      return;
    }

    const hasPrimaryKey = validColumns.some(c => c.isPrimary);
    if (!hasPrimaryKey) {
      alert('Please designate at least one column as PRIMARY KEY');
      return;
    }

    const newNode = {
      id: `table-${Date.now()}`,
      type: 'tableNode',
      position: { x: 100 + nodes.length * 280, y: 100 + nodes.length * 50 },
      data: { 
        label: newTable.name, 
        columns: validColumns 
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setShowTableForm(false);
    setNewTable({ name: '', columns: [{ name: '', type: 'VARCHAR(255)', isPrimary: false, isForeign: false }] });
    setFeedback('✅ Table added successfully! Continue designing or run tests');
  };

  const generateSQL = () => {
    if (nodes.length === 0) {
      return '';
    }

    let sql = '-- Database Schema\n\n';
    
    nodes.forEach(node => {
      const tableName = node.data.label;
      const columns = node.data.columns;
      
      sql += `CREATE TABLE ${tableName} (\n`;
      sql += columns.map(col => {
        let colDef = `  ${col.name} ${col.type}`;
        if (col.isPrimary) colDef += ' PRIMARY KEY';
        return colDef;
      }).join(',\n');
      sql += '\n);\n\n';
    });

    return sql;
  };

  const runAllTests = async () => {
    if (nodes.length === 0) {
      setFeedback('⚠️ Please design your database schema first');
      return;
    }

    setTestResults([]);
    setTotalScore(0);
    setFeedback('🔍 Running tests...');
    setShowTestResults(true);

    const results = [];
    let score = 0;

    const ddl = generateSQL();
    setSqlGenerated(ddl);

    try {
      db.getTableNames().forEach(tableName => {
        db.run(`DROP TABLE IF EXISTS ${tableName}`);
      });

      const statements = ddl.split(';').filter(s => s.trim() && !s.trim().startsWith('--'));
      statements.forEach(statement => {
        if (statement.trim()) {
          db.run(statement);
        }
      });

      for (let i = 0; i < PROBLEM.testCases.length; i++) {
        const testCase = PROBLEM.testCases[i];
        const result = await runTestCase(testCase);
        results.push(result);
        if (result.passed) {
          score += testCase.points;
        }
      }

      setTestResults(results);
      setTotalScore(score);
      
      const maxScore = PROBLEM.testCases.reduce((sum, tc) => sum + tc.points, 0);
      const percentage = Math.round((score / maxScore) * 100);
      
      if (percentage === 100) {
        setFeedback(`🎉 Perfect Score! All tests passed! ${score}/${maxScore} (${percentage}%)`);
      } else if (percentage >= 70) {
        setFeedback(`✅ Good Progress! ${score}/${maxScore} (${percentage}%). Review failed tests.`);
      } else {
        setFeedback(`❌ Needs Improvement. ${score}/${maxScore} (${percentage}%). Check feedback below.`);
      }
    } catch (error) {
      setFeedback(`❌ Error: ${error.message}`);
      console.error('Test execution error:', error);
    }
  };

  const runTestCase = async (testCase) => {
    try {
      if (testCase.type === 'schema') {
        return validateSchema(testCase);
      } else if (testCase.type === 'query') {
        return await validateQuery(testCase);
      }
    } catch (error) {
      return {
        name: testCase.name,
        passed: false,
        message: `Error: ${error.message}`,
        points: 0,
        maxPoints: testCase.points,
        query: testCase.query
      };
    }
  };

  const validateSchema = (testCase) => {
    const actualTables = nodes.map(n => ({
      name: n.data.label.toLowerCase(),
      columns: n.data.columns.map(c => c.name.toLowerCase())
    }));

    const expectedTables = testCase.expectedTables.map(t => ({
      name: t.name.toLowerCase(),
      columns: t.columns.map(c => c.toLowerCase())
    }));

    let missingTables = [];
    let missingColumns = [];

    expectedTables.forEach(expected => {
      const found = actualTables.find(t => t.name === expected.name);
      if (!found) {
        missingTables.push(expected.name);
      } else {
        expected.columns.forEach(col => {
          if (!found.columns.includes(col)) {
            missingColumns.push(`${expected.name}.${col}`);
          }
        });
      }
    });

    const passed = missingTables.length === 0 && missingColumns.length === 0;
    
    let message = '';
    if (passed) {
      message = 'Schema structure is correct';
    } else {
      if (missingTables.length > 0) {
        message += `Missing tables: ${missingTables.join(', ')}. `;
      }
      if (missingColumns.length > 0) {
        message += `Missing columns: ${missingColumns.join(', ')}`;
      }
    }

    return {
      name: testCase.name,
      passed,
      message,
      points: passed ? testCase.points : 0,
      maxPoints: testCase.points
    };
  };

  const validateQuery = async (testCase) => {
    if (testCase.seedData) {
      try {
        if (Array.isArray(testCase.seedData)) {
          const tableName = nodes[0]?.data.label || 'customers';
          db.run(`DELETE FROM ${tableName}`);
          
          testCase.seedData.forEach(row => {
            const values = row.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
            db.run(`INSERT INTO ${tableName} VALUES (${values})`);
          });
        } else {
          for (const [tableName, data] of Object.entries(testCase.seedData)) {
            db.run(`DELETE FROM ${tableName}`);
            
            data.forEach(row => {
              const values = row.map(v => typeof v === 'string' ? `'${v}'` : v).join(', ');
              db.run(`INSERT INTO ${tableName} VALUES (${values})`);
            });
          }
        }
      } catch (error) {
        return {
          name: testCase.name,
          passed: false,
          message: `Failed to seed data: ${error.message}`,
          points: 0,
          maxPoints: testCase.points,
          query: testCase.query
        };
      }
    }

    try {
      const result = db.execRawQuery(testCase.query);
      const actualOutput = result[0]?.values || [];
      const expectedOutput = testCase.expectedOutput;

      const passed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);

      return {
        name: testCase.name,
        passed,
        message: passed 
          ? 'Query executed correctly' 
          : `Expected ${expectedOutput.length} rows but got ${actualOutput.length}`,
        points: passed ? testCase.points : 0,
        maxPoints: testCase.points,
        query: testCase.query
      };
    } catch (error) {
      return {
        name: testCase.name,
        passed: false,
        message: `Query error: ${error.message}`,
        points: 0,
        maxPoints: testCase.points,
        query: testCase.query
      };
    }
  };

  const runUserQuery = () => {
    if (!userQuery.trim()) {
      setFeedback('⚠️ Please enter a SQL query');
      return;
    }

    try {
      const result = db.execRawQuery(userQuery);
      setQueryResult(result);
      setFeedback('✅ Query executed successfully');
    } catch (error) {
      setQueryResult(null);
      setFeedback(`❌ SQL Error: ${error.message}`);
    }
  };

  const resetProblem = () => {
    setNodes([]);
    setEdges([]);
    setTestResults([]);
    setTotalScore(0);
    setFeedback('');
    setSqlGenerated('');
    setUserQuery('');
    setQueryResult(null);
    setShowTestResults(false);
    
    db.getTableNames().forEach(tableName => {
      db.run(`DROP TABLE IF EXISTS ${tableName}`);
    });
  };

  const maxPossibleScore = PROBLEM.testCases.reduce((sum, tc) => sum + tc.points, 0);
  const scorePercentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  return (
    <div className="flex h-screen bg-black">
      {/* LEFT PANEL - EXPANDED */}
      <div className="w-[550px] bg-[#0a0a0a] border-r border-[#1a1a1a] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 text-xs text-[#00d9a3] font-semibold tracking-wider">
              <div className="w-2 h-2 bg-[#00d9a3] rounded-full"></div>
              <span>SQL CHALLENGE</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{PROBLEM.title}</h1>
            <div className="flex items-center gap-3">
              <span className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wide bg-[#ffd700] text-black">
                {PROBLEM.difficulty}
              </span>
              <span className="text-gray-500 text-sm">{PROBLEM.testCases.length} test cases</span>
              <span className="text-gray-500 text-sm flex items-center gap-1.5">
                <Trophy size={16} className="text-[#00d9a3]" />
                {maxPossibleScore} pts
              </span>
            </div>
          </div>

          <p className="text-gray-300 mb-6 text-sm leading-relaxed">{PROBLEM.description}</p>
          
          {/* Requirements */}
          <div className="mb-6 bg-[#1a1a1a] border-l-4 border-[#00d9a3] p-4 rounded-r">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <AlertCircle size={16} className="text-[#00d9a3]" />
              Requirements
            </h3>
            <ul className="text-xs text-gray-400 space-y-2">
              {PROBLEM.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#00d9a3] mt-0.5 font-bold">→</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hints */}
          <div className="mb-6 bg-[#1a1a1a] border-l-4 border-[#ffd700] p-4 rounded-r">
            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">💡 Hints</h3>
            <ul className="text-xs text-gray-400 space-y-2">
              {PROBLEM.hints.map((hint, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#ffd700] mt-0.5 font-bold">•</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Score Display */}
          <div className="mb-6 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] p-5 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-white uppercase tracking-wide">Your Score</span>
              <Trophy size={20} className="text-[#ffd700]" />
            </div>
            <div className="text-5xl font-black text-white mb-3">
              {totalScore} <span className="text-2xl text-gray-600">/ {maxPossibleScore}</span>
            </div>
            <div className="bg-[#0a0a0a] rounded-full h-3 overflow-hidden mb-2 border border-[#2a2a2a]">
              <div 
                className="bg-gradient-to-r from-[#00d9a3] to-[#00b386] h-full transition-all duration-500"
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 font-semibold">{scorePercentage}% Complete</div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`p-4 rounded-lg mb-6 text-sm font-medium border ${
              feedback.includes('✅') || feedback.includes('🎉') 
                ? 'bg-[#00d9a3]/10 border-[#00d9a3] text-[#00d9a3]' 
                : feedback.includes('❌') 
                ? 'bg-[#ff4757]/10 border-[#ff4757] text-[#ff4757]'
                : 'bg-[#ffd700]/10 border-[#ffd700] text-[#ffd700]'
            }`}>
              {feedback}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setShowTableForm(!showTableForm)}
              className="w-full bg-gradient-to-r from-[#00d9a3] to-[#00b386] hover:from-[#00b386] hover:to-[#00d9a3] text-black py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-wide shadow-lg shadow-[#00d9a3]/20"
            >
              <Plus size={18} />
              Add Table
            </button>

            {nodes.length > 0 && (
              <button
                onClick={runAllTests}
                className="w-full bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#6366f1] text-white py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-wide shadow-lg shadow-[#6366f1]/20"
              >
                <Play size={18} />
                Run All Tests
              </button>
            )}

            <button
              onClick={resetProblem}
              className="w-full bg-[#1a1a1a] hover:bg-[#242424] text-white border border-[#2a2a2a] py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-wide"
            >
              <RefreshCw size={18} />
              Reset Problem
            </button>
          </div>

          {/* Practice Query Section */}
          <div className="border-t border-[#1a1a1a] pt-6 mb-6">
            <h3 className="font-bold text-white mb-3 text-sm flex items-center gap-2 uppercase tracking-wide">
              <Code size={16} className="text-[#00d9a3]" />
              Practice Queries
            </h3>
            <p className="text-xs text-gray-500 mb-3">Write and test your SQL queries</p>
            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="-- Write your SQL query here&#10;&#10;SELECT * FROM customers&#10;WHERE email LIKE '%example.com%';"
              className="w-full h-32 p-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#00d9a3] focus:border-[#00d9a3] mb-3 resize-none text-[#00d9a3] placeholder-gray-600"
              style={{ lineHeight: '1.6' }}
            />
            <button
              onClick={runUserQuery}
              className="w-full bg-gradient-to-r from-[#00d9a3] to-[#00b386] hover:from-[#00b386] hover:to-[#00d9a3] text-black py-3 px-4 rounded-lg text-sm flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-wide"
            >
              <Play size={18} />
              Execute Query
            </button>
          </div>

          {/* Generated SQL Display */}
          {sqlGenerated && (
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-sm text-white uppercase tracking-wide">Generated DDL:</h3>
              <pre className="bg-[#0a0a0a] text-[#00d9a3] p-4 rounded-lg text-xs overflow-x-auto max-h-60 font-mono leading-relaxed border border-[#1a1a1a]">
                {sqlGenerated}
              </pre>
            </div>
          )}

          {/* Query Results Display */}
          {queryResult && queryResult.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-sm text-white uppercase tracking-wide">Query Results:</h3>
              <div className="overflow-x-auto max-h-72 border border-[#2a2a2a] rounded-lg">
                <table className="min-w-full text-xs">
                  <thead className="bg-[#1a1a1a] sticky top-0">
                    <tr>
                      {queryResult[0].columns.map((col, i) => (
                        <th key={i} className="border-b border-[#2a2a2a] px-4 py-3 text-left font-bold text-[#00d9a3] uppercase tracking-wide">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-[#0a0a0a]">
                    {queryResult[0].values.map((row, i) => (
                      <tr key={i} className="hover:bg-[#1a1a1a] border-b border-[#1a1a1a] last:border-b-0 transition-colors">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-3 text-gray-300 font-mono">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {queryResult && queryResult.length === 0 && (
            <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg text-center text-gray-500 text-sm border border-[#2a2a2a]">
              Query executed (0 rows returned)
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - React Flow Canvas */}
      <div className="flex-1 relative bg-[#0a0a0a]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[#0a0a0a]"
        >
          <Background color="#1a1a1a" gap={20} size={1} />
          <Controls className="bg-[#1a1a1a] border-[#2a2a2a]" />
        </ReactFlow>

        {nodes.length === 0 && !showTableForm && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-600">
              <Database size={72} className="mx-auto mb-4 opacity-20" />
              <p className="text-2xl font-bold mb-2">Design Your Database</p>
              <p className="text-sm">Click "Add Table" to start building your schema</p>
            </div>
          </div>
        )}

        {/* Table Creation Form Modal */}
        {showTableForm && (
          <div className="absolute top-6 left-6 bg-[#0a0a0a] p-6 rounded-lg shadow-2xl border border-[#2a2a2a] z-10 w-[480px] max-h-[85vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-5 flex items-center gap-2 text-white uppercase tracking-wide">
              <Database size={24} className="text-[#00d9a3]" />
              Create New Table
            </h3>
            
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Table Name</label>
              <input
                type="text"
                placeholder="e.g., customers, orders"
                value={newTable.name}
                onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                className="w-full p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm focus:ring-2 focus:ring-[#00d9a3] focus:border-[#00d9a3] text-white placeholder-gray-600"
              />
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">Columns:</p>
              <div className="space-y-3">
                {newTable.columns.map((col, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Column name"
                        value={col.name}
                        onChange={(e) => updateColumn(idx, 'name', e.target.value)}
                        className="w-full p-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-sm text-white placeholder-gray-600 focus:ring-2 focus:ring-[#00d9a3] focus:border-[#00d9a3]"
                      />
                      <select
                        value={col.type}
                        onChange={(e) => updateColumn(idx, 'type', e.target.value)}
                        className="w-full p-2.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-sm text-white focus:ring-2 focus:ring-[#00d9a3] focus:border-[#00d9a3]"
                      >
                        <option value="INT">INT</option>
                        <option value="VARCHAR(255)">VARCHAR(255)</option>
                        <option value="TEXT">TEXT</option>
                        <option value="DATE">DATE</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                        <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                      </select>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-gray-300 hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={col.isPrimary}
                            onChange={(e) => updateColumn(idx, 'isPrimary', e.target.checked)}
                            className="w-4 h-4 cursor-pointer accent-[#00d9a3]"
                          />
                          Primary Key
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-gray-300 hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={col.isForeign}
                            onChange={(e) => updateColumn(idx, 'isForeign', e.target.checked)}
                            className="w-4 h-4 cursor-pointer accent-[#00d9a3]"
                          />
                          Foreign Key
                        </label>
                      </div>
                    </div>
                    {newTable.columns.length > 1 && (
                      <button
                        onClick={() => removeColumn(idx)}
                        className="p-2 text-[#ff4757] hover:bg-[#ff4757]/10 rounded-lg transition-colors mt-1"
                        title="Remove column"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={addColumn}
                className="flex-1 bg-[#1a1a1a] hover:bg-[#242424] text-white py-3 rounded-lg text-sm font-bold transition-colors border border-[#2a2a2a]"
              >
                + Add Column
              </button>
              <button
                onClick={createTable}
                className="flex-1 bg-gradient-to-r from-[#00d9a3] to-[#00b386] hover:from-[#00b386] hover:to-[#00d9a3] text-black py-3 rounded-lg text-sm font-bold transition-all"
              >
                ✓ Create Table
              </button>
              <button
                onClick={() => setShowTableForm(false)}
                className="px-4 bg-[#1a1a1a] hover:bg-[#242424] text-white py-3 rounded-lg transition-colors border border-[#2a2a2a]"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Test Results Panel - Bottom Right */}
        {showTestResults && testResults.length > 0 && (
          <div className="absolute bottom-6 right-6 w-[450px] max-h-[70vh] bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg shadow-2xl overflow-hidden z-10">
            <div className="bg-[#1a1a1a] px-5 py-4 flex items-center justify-between border-b border-[#2a2a2a]">
              <h3 className="font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
                <BookOpen size={16} className="text-[#00d9a3]" />
                Test Results
              </h3>
              <button
                onClick={() => setShowTestResults(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-4">
              <div className="space-y-3">
                {testResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border text-xs ${
                      result.passed 
                        ? 'bg-[#00d9a3]/10 border-[#00d9a3]' 
                        : 'bg-[#ff4757]/10 border-[#ff4757]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white flex items-center gap-2">
                        {result.passed ? <CheckCircle size={16} className="text-[#00d9a3]" /> : <XCircle size={16} className="text-[#ff4757]" />}
                        {result.name}
                      </span>
                      <span className={`text-xs font-bold ${result.passed ? 'text-[#00d9a3]' : 'text-[#ff4757]'}`}>
                        {result.points}/{result.maxPoints} pts
                      </span>
                    </div>
                    <p className={`mb-2 ${result.passed ? 'text-gray-400' : 'text-gray-300'}`}>{result.message}</p>
                    {result.query && (
                      <div className="bg-[#0a0a0a] text-[#00d9a3] p-3 rounded text-xs font-mono mt-2 border border-[#1a1a1a]">
                        {result.query}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
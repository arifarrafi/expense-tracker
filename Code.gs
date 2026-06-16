// ============================================================
// EXPENSEIQ — Code.gs  |  Google Apps Script REST API Backend
// Architecture: GitHub Pages (frontend) + GAS Web App (backend)
// ============================================================

/**
 * All requests arrive as GET calls from the frontend.
 * Route them by the ?action= query parameter.
 *
 * Deploy settings:
 *   Execute as  →  Me
 *   Who has access  →  Anyone
 */
function doGet(e) {
  initializeSheets();           // ensure all sheets exist on every request

  const p      = e.parameter || {};
  const action = p.action;

  if (!action) {
    return json({ success: true, message: 'ExpenseIQ API is running ✓' });
  }

  let result;
  try {
    result = route(action, p);
  } catch (err) {
    result = { success: false, error: err.message };
  }
  return json(result);
}

/** Wrap any object as a JSON ContentService output */
function json(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Route action string → handler function */
function route(action, p) {
  switch (action) {

    /* ── Categories (Settings sheet) ── */
    case 'getCategories':
      return getCategories();

    case 'saveCategories':
      return saveCategories(
        JSON.parse(p.itemTypes    || '[]'),
        JSON.parse(p.unitTypes    || '[]'),
        JSON.parse(p.trackedItems || '[]')
      );

    /* ── Store Expenses (Detailed_List) ── */
    case 'getAllExpenses':
      return getAllExpenses();

    case 'addExpense':
      return addExpense(JSON.parse(p.data));

    case 'updateExpense':
      return updateExpense(+p.rowIndex, JSON.parse(p.data));

    case 'deleteExpense':
      return deleteExpense(+p.rowIndex);

    /* ── Ledger (Income & Expense entries) ── */
    case 'getAllLedgerEntries':
      return getAllLedgerEntries();

    case 'addLedgerEntry':
      return addLedgerEntry(JSON.parse(p.data));

    case 'updateLedgerEntry':
      return updateLedgerEntry(+p.rowIndex, JSON.parse(p.data));

    case 'deleteLedgerEntry':
      return deleteLedgerEntry(+p.rowIndex);

    /* ── Fixed Expenses ── */
    case 'getAllFixedExpenses':
      return getAllFixedExpenses();

    case 'addFixedExpense':
      return addFixedExpense(JSON.parse(p.data));

    case 'updateFixedExpense':
      return updateFixedExpense(+p.rowIndex, JSON.parse(p.data));

    case 'deleteFixedExpense':
      return deleteFixedExpense(+p.rowIndex);

    /* ── Dashboard & Analytics ── */
    case 'getDashboardData':
      return getDashboardData(+p.month, +p.year);

    case 'getItemTrendData':
      return getItemTrendData(p.itemName);

    case 'getTrackedItemsData':
      return getTrackedItemsData(JSON.parse(p.items || '[]'));

    /* ── Budget ── */
    case 'getBudget':
      return getBudget(p.monthYear);

    case 'setBudget':
      return setBudget(p.monthYear, +p.amount);

    default:
      return { success: false, error: 'Unknown action: ' + action };
  }
}

// ============================================================
// SHEET INITIALISATION
// ============================================================

function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  /* ── Detailed_List ── */
  if (!ss.getSheetByName('Detailed_List')) {
    const s = ss.insertSheet('Detailed_List');
    s.getRange('C2:I2')
      .setValues([['Date','Items','Item Type','Quantity','Unit Type','Unit Price','Price']])
      .setFontWeight('bold')
      .setBackground('#F59E0B')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
    s.setFrozenRows(2);
    [100,200,130,80,120,100,100].forEach((w,i) => s.setColumnWidth(i+3, w));
    s.setColumnWidth(1, 30);
    s.setColumnWidth(2, 30);
  }

  /* ── Ledger ── */
  if (!ss.getSheetByName('Ledger')) {
    const s = ss.insertSheet('Ledger');
    s.getRange('A1:E1')
      .setValues([['Month-Year','Type','Title','Details','Amount']])
      .setFontWeight('bold')
      .setBackground('#6366F1')
      .setFontColor('#FFFFFF');
    s.setFrozenRows(1);
    s.getRange('A2:A5000').setNumberFormat('@');
    [100,90,200,250,120].forEach((w,i) => s.setColumnWidth(i+1, w));
  }

  /* ── Fixed_Expenses ── */
  if (!ss.getSheetByName('Fixed_Expenses')) {
    const s = ss.insertSheet('Fixed_Expenses');
    s.getRange('A1:E1')
      .setValues([['Description','Amount','Category','Notes','Active']])
      .setFontWeight('bold')
      .setBackground('#FB923C')
      .setFontColor('#FFFFFF');
    s.setFrozenRows(1);
    [200,120,150,200,70].forEach((w,i) => s.setColumnWidth(i+1, w));
  }

  /* ── Budget ── */
  if (!ss.getSheetByName('Budget')) {
    const s = ss.insertSheet('Budget');
    s.getRange('A1:B1')
      .setValues([['Month-Year','Budget']])
      .setFontWeight('bold')
      .setBackground('#A78BFA')
      .setFontColor('#FFFFFF');
    s.setFrozenRows(1);
  }

  /* ── Settings ── */
  if (!ss.getSheetByName('Settings')) {
    const s = ss.insertSheet('Settings');
    s.getRange('A1:C1')
      .setValues([['Item Types','Unit Types','Tracked Items']])
      .setFontWeight('bold')
      .setBackground('#E5E7EB');
    const itemTypes    = ['Food','Personal Care','Health Care','Cleaning','Snacks',
                          'Home Appliance','Bill','Transportation','Stationary',
                          'Job Application','Fashion','Gift','Trip'];
    const unitTypes    = ['Liter','Role','Bulk','Per Month','Per Item','Per Journey','Per Circular'];
    const trackedItems = ['Rice','Egg','Oil','Milk','Bread'];
    itemTypes.forEach((v,i)    => s.getRange(i+2, 1).setValue(v));
    unitTypes.forEach((v,i)    => s.getRange(i+2, 2).setValue(v));
    trackedItems.forEach((v,i) => s.getRange(i+2, 3).setValue(v));
    [160,160,160].forEach((w,i) => s.setColumnWidth(i+1, w));
  }
}

// ============================================================
// CATEGORIES  (Settings sheet)
// ============================================================

function getCategories() {
  try {
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
    if (!s) return { success: true, itemTypes: [], unitTypes: [], trackedItems: [] };
    const lr = s.getLastRow();
    const itemTypes = [], unitTypes = [], trackedItems = [];
    if (lr >= 2) {
      s.getRange(2, 1, lr-1, 3).getValues().forEach(r => {
        if (r[0] !== '') itemTypes.push(String(r[0]).trim());
        if (r[1] !== '') unitTypes.push(String(r[1]).trim());
        if (r[2] !== '') trackedItems.push(String(r[2]).trim());
      });
    }
    return { success: true, itemTypes, unitTypes, trackedItems };
  } catch(e) {
    return { success: false, error: e.message, itemTypes: [], unitTypes: [], trackedItems: [] };
  }
}

function saveCategories(itemTypes, unitTypes, trackedItems) {
  try {
    const s  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
    const lr = s.getLastRow();
    if (lr > 1) s.getRange(2, 1, lr-1, 3).clearContent();
    const max = Math.max(itemTypes.length, unitTypes.length, (trackedItems||[]).length);
    if (max > 0) {
      s.getRange(2, 1, max, 3).setValues(
        Array.from({ length: max }, (_, i) => [
          itemTypes[i]          || '',
          unitTypes[i]          || '',
          (trackedItems||[])[i] || ''
        ])
      );
    }
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ============================================================
// EXPENSES  (Detailed_List — C2:I2 headers, data from C3)
// ============================================================

function addExpense(d) {
  try {
    const s   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Detailed_List');
    const row = Math.max(s.getLastRow() + 1, 3);
    const price = parseFloat(d.quantity || 0) * parseFloat(d.unitPrice || 0);
    s.getRange(row, 3, 1, 7).setValues([[
      new Date(d.date),
      d.item.trim(),
      d.itemType.trim(),
      parseFloat(d.quantity  || 0),
      d.unitType.trim(),
      parseFloat(d.unitPrice || 0),
      price
    ]]);
    s.getRange(row, 3).setNumberFormat('yyyy-mm-dd');
    s.getRange(row, 8, 1, 2).setNumberFormat('#,##0.00');
    if (row % 2 === 0) s.getRange(row, 3, 1, 7).setBackground('#FFFBF3');
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function getAllExpenses() {
  try {
    const s  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Detailed_List');
    if (!s) return { success: true, data: [] };
    const lr = s.getLastRow();
    if (lr < 3) return { success: true, data: [] };
    const tz   = Session.getScriptTimeZone();
    const data = s.getRange(3, 3, lr-2, 7).getValues()
      .map((r, i) => ({
        rowIndex:  i + 3,
        date:      r[0] ? Utilities.formatDate(new Date(r[0]), tz, 'yyyy-MM-dd') : '',
        item:      r[1] || '',
        itemType:  r[2] || '',
        quantity:  parseFloat(r[3]) || 0,
        unitType:  r[4] || '',
        unitPrice: parseFloat(r[5]) || 0,
        price:     parseFloat(r[6]) || 0
      }))
      .filter(r => r.item !== '');
    return { success: true, data };
  } catch(e) {
    return { success: false, error: e.message, data: [] };
  }
}

function updateExpense(rowIndex, d) {
  try {
    const s     = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Detailed_List');
    const price = parseFloat(d.quantity || 0) * parseFloat(d.unitPrice || 0);
    s.getRange(rowIndex, 3, 1, 7).setValues([[
      new Date(d.date),
      d.item.trim(),
      d.itemType.trim(),
      parseFloat(d.quantity  || 0),
      d.unitType.trim(),
      parseFloat(d.unitPrice || 0),
      price
    ]]);
    s.getRange(rowIndex, 3).setNumberFormat('yyyy-mm-dd');
    s.getRange(rowIndex, 8, 1, 2).setNumberFormat('#,##0.00');
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function deleteExpense(rowIndex) {
  try {
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Detailed_List')
      .deleteRow(rowIndex);
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ============================================================
// LEDGER  (unified Income & Expense entries)
// Schema: A=Month-Year  B=Type  C=Title  D=Details  E=Amount
// ============================================================

function addLedgerEntry(d) {
  try {
    const s   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ledger');
    const row = Math.max(s.getLastRow() + 1, 2);
    s.getRange(row, 1).setNumberFormat('@');
    s.getRange(row, 1, 1, 5).setValues([[
      d.monthYear || '',
      d.type      || 'Income',
      (d.title    || '').trim(),
      d.details   || '',
      parseFloat(d.amount || 0)
    ]]);
    s.getRange(row, 5).setNumberFormat('#,##0.00');
    s.getRange(row, 1, 1, 5)
      .setBackground(d.type === 'Income' ? '#F0FDF4' : '#FFF1F2');
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function getAllLedgerEntries() {
  try {
    const s  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ledger');
    if (!s) return { success: true, data: [] };
    const lr = s.getLastRow();
    if (lr < 2) return { success: true, data: [] };

    function toMonthYear(v) {
      if (!v && v !== 0) return '';
      if (v instanceof Date) {
        return v.getFullYear() + '-' + String(v.getMonth() + 1).padStart(2, '0');
      }
      return String(v).trim();
    }

    const data = s.getRange(2, 1, lr-1, 5).getValues()
      .map((r, i) => ({
        rowIndex:  i + 2,
        monthYear: toMonthYear(r[0]),
        type:      String(r[1] || 'Income').trim(),
        title:     String(r[2] || '').trim(),
        details:   String(r[3] || '').trim(),
        amount:    parseFloat(r[4]) || 0
      }))
      .filter(r => r.title !== '');
    return { success: true, data };
  } catch(e) {
    return { success: false, error: e.message, data: [] };
  }
}

function updateLedgerEntry(rowIndex, d) {
  try {
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ledger');
    s.getRange(rowIndex, 1).setNumberFormat('@');
    s.getRange(rowIndex, 1, 1, 5).setValues([[
      d.monthYear || '',
      d.type      || 'Income',
      (d.title    || '').trim(),
      d.details   || '',
      parseFloat(d.amount || 0)
    ]]);
    s.getRange(rowIndex, 5).setNumberFormat('#,##0.00');
    s.getRange(rowIndex, 1, 1, 5)
      .setBackground(d.type === 'Income' ? '#F0FDF4' : '#FFF1F2');
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function deleteLedgerEntry(rowIndex) {
  try {
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Ledger')
      .deleteRow(rowIndex);
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ============================================================
// FIXED EXPENSES
// ============================================================

function addFixedExpense(d) {
  try {
    const s   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Fixed_Expenses');
    const row = Math.max(s.getLastRow() + 1, 2);
    s.getRange(row, 1, 1, 5).setValues([[
      d.description.trim(),
      parseFloat(d.amount || 0),
      d.category || '',
      d.notes    || '',
      true
    ]]);
    s.getRange(row, 2).setNumberFormat('#,##0.00');
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function getAllFixedExpenses() {
  try {
    const s  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Fixed_Expenses');
    if (!s) return { success: true, data: [] };
    const lr = s.getLastRow();
    if (lr < 2) return { success: true, data: [] };
    const data = s.getRange(2, 1, lr-1, 5).getValues()
      .map((r, i) => ({
        rowIndex:    i + 2,
        description: r[0] || '',
        amount:      parseFloat(r[1]) || 0,
        category:    r[2] || '',
        notes:       r[3] || '',
        active:      r[4] !== false
      }))
      .filter(r => r.description !== '');
    return { success: true, data };
  } catch(e) {
    return { success: false, error: e.message, data: [] };
  }
}

function updateFixedExpense(rowIndex, d) {
  try {
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Fixed_Expenses');
    s.getRange(rowIndex, 1, 1, 5).setValues([[
      d.description.trim(),
      parseFloat(d.amount || 0),
      d.category || '',
      d.notes    || '',
      d.active !== false
    ]]);
    s.getRange(rowIndex, 2).setNumberFormat('#,##0.00');
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function deleteFixedExpense(rowIndex) {
  try {
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Fixed_Expenses')
      .deleteRow(rowIndex);
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ============================================================
// BUDGET
// ============================================================

function setBudget(monthYear, amount) {
  try {
    const s  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Budget');
    const lr = s.getLastRow();
    if (lr >= 2) {
      const vals = s.getRange(2, 1, lr-1, 1).getValues();
      for (let i = 0; i < vals.length; i++) {
        if (vals[i][0] === monthYear) {
          s.getRange(i+2, 2).setValue(parseFloat(amount || 0));
          return { success: true };
        }
      }
    }
    s.getRange(Math.max(lr+1, 2), 1, 1, 2)
      .setValues([[monthYear, parseFloat(amount || 0)]]);
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

function getBudget(monthYear) {
  try {
    const s  = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Budget');
    if (!s) return { success: true, budget: 0 };
    const lr = s.getLastRow();
    if (lr < 2) return { success: true, budget: 0 };
    const row = s.getRange(2, 1, lr-1, 2).getValues()
      .find(r => r[0] === monthYear);
    return { success: true, budget: row ? parseFloat(row[1]) || 0 : 0 };
  } catch(e) {
    return { success: false, error: e.message, budget: 0 };
  }
}

// ============================================================
// DASHBOARD
// ============================================================

function getDashboardData(month, year) {
  try {
    const allExp    = getAllExpenses().data      || [];
    const allLedger = getAllLedgerEntries().data || [];
    const allFix    = getAllFixedExpenses().data || [];
    const my        = `${year}-${String(month).padStart(2, '0')}`;
    const budget    = getBudget(my).budget      || 0;

    const inMonth = e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
    };

    const mExp          = allExp.filter(inMonth);
    const totalStoreExp = mExp.reduce((s, e) => s + (e.price || 0), 0);
    const fixTotal      = allFix.filter(f => f.active).reduce((s, f) => s + (f.amount || 0), 0);
    const mLedger       = allLedger.filter(e => e.monthYear === my);
    const ledgerIncItems= mLedger.filter(e => e.type === 'Income');
    const ledgerExpItems= mLedger.filter(e => e.type === 'Expense');
    const ledgerIncome  = ledgerIncItems.reduce((s, e) => s + (e.amount || 0), 0);
    const ledgerExpense = ledgerExpItems.reduce((s, e) => s + (e.amount || 0), 0);
    const totalExpAll   = Math.round(totalStoreExp) + fixTotal + ledgerExpense;
    const balance       = ledgerIncome - totalExpAll;

    const catBreakdown = {};
    mExp.forEach(e => {
      catBreakdown[e.itemType] = (catBreakdown[e.itemType] || 0) + (e.price || 0);
    });

    const dim   = new Date(year, month, 0).getDate();
    const daily = {};
    for (let i = 1; i <= dim; i++) daily[i] = 0;
    mExp.forEach(e => {
      const d = new Date(e.date).getDate();
      daily[d] = (daily[d] || 0) + (e.price || 0);
    });

    const now          = new Date();
    const monthlyTrend = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyTrend[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`] = 0;
    }
    allExp.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (k in monthlyTrend) monthlyTrend[k] += (e.price || 0);
    });

    return {
      success: true,
      ledgerIncome, totalStoreExp, totalExpAll,
      ledgerExpense, fixTotal, balance, budget,
      catBreakdown, daily, dim, monthlyTrend,
      ledgerIncItems, ledgerExpItems
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ============================================================
// ITEM TREND
// ============================================================

function getItemTrendData(itemName) {
  try {
    const all      = getAllExpenses().data || [];
    const filtered = all.filter(e =>
      e.item.toLowerCase().includes(itemName.toLowerCase())
    );
    const monthly = {};
    filtered.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!monthly[k]) monthly[k] = { total: 0, qty: 0, count: 0 };
      monthly[k].total += (e.price    || 0);
      monthly[k].qty   += (e.quantity || 0);
      monthly[k].count += 1;
    });
    const yearly = {};
    let lifetime = 0;
    Object.entries(monthly).forEach(([k, v]) => {
      const yr = k.split('-')[0];
      if (!yearly[yr]) yearly[yr] = 0;
      yearly[yr] += v.total;
      lifetime   += v.total;
    });
    return { success: true, data: monthly, yearly, lifetime, itemName };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ============================================================
// TRACKED ITEMS
// ============================================================

function getTrackedItemsData(trackedItems) {
  try {
    const all    = getAllExpenses().data || [];
    const result = {};
    trackedItems.forEach(name => {
      const filtered = all.filter(e =>
        e.item.toLowerCase().includes(name.toLowerCase())
      );
      const monthly = {};
      filtered.forEach(e => {
        if (!e.date) return;
        const d = new Date(e.date);
        const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        if (!monthly[k]) monthly[k] = { total: 0, qty: 0 };
        monthly[k].total += (e.price    || 0);
        monthly[k].qty   += (e.quantity || 0);
      });
      const months    = Object.values(monthly);
      const avgCost   = months.length ? months.reduce((s,m) => s + m.total, 0) / months.length : 0;
      const avgQty    = months.length ? months.reduce((s,m) => s + m.qty,   0) / months.length : 0;
      const lastMonth = Object.entries(monthly)
        .sort((a, b) => b[0].localeCompare(a[0]))[0];
      result[name] = {
        avgCost:   Math.round(avgCost  * 100) / 100,
        avgQty:    Math.round(avgQty   * 100) / 100,
        months:    months.length,
        lastCost:  lastMonth ? lastMonth[1].total : 0,
        lastMonth: lastMonth ? lastMonth[0]       : ''
      };
    });
    return { success: true, data: result };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

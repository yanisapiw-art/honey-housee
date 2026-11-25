const SHEET_ORDERS = "Orders";
const SHEET_PRODUCTS = "Products";
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let p = ss.getSheetByName(SHEET_PRODUCTS) || ss.insertSheet(SHEET_PRODUCTS);
  if (p.getLastRow() === 0) {
    p.appendRow(["SKU","Name","Price","Stock","Active"]);
    p.appendRow(["HH-001","น้ำผึ้งดอกลำไย 250 กรัม",159,50,true]);
    p.appendRow(["HH-002","น้ำผึ้งป่า 500 กรัม",279,35,true]);
  }
  let o = ss.getSheetByName(SHEET_ORDERS) || ss.insertSheet(SHEET_ORDERS);
  if (o.getLastRow() === 0) o.appendRow(["Order ID","Created At","Customer Name","Phone","Address","Note","Items JSON","Total","Status"]);
  return "Sheets are ready";
}
function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = data.action;
    if (action === "createOrder") return json_(createOrder_(data.order || {}));
    if (!authorized_(data.token)) return json_({ok:false,message:"Unauthorized"});
    if (action === "listOrders") return json_(listOrders_());
    if (action === "updateStatus") return json_(updateStatus_(data.orderId,data.status));
    return json_({ok:false,message:"Unknown action"});
  } catch (err) { return json_({ok:false,message:String(err)}); }
}
function createOrder_(order) {
  if (!order.customerName || !order.phone || !order.address || !Array.isArray(order.items) || !order.items.length) throw new Error("ข้อมูลคำสั่งซื้อไม่ครบ");
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const ss=SpreadsheetApp.getActiveSpreadsheet(), sh=ss.getSheetByName(SHEET_ORDERS), ps=ss.getSheetByName(SHEET_PRODUCTS);
    if (!sh || !ps) throw new Error("กรุณารัน setupSheets ก่อน");
    const values=ps.getDataRange().getValues(), rows=values.slice(1), updates=[];
    let total=0;
    order.items.forEach(item=>{
      const idx=rows.findIndex(r=>String(r[0])===String(item.sku));
      if(idx<0) throw new Error("ไม่พบสินค้า "+item.sku);
      const row=rows[idx], qty=Number(item.qty), stock=Number(row[3]), price=Number(row[2]);
      if(!Number.isInteger(qty)||qty<1||stock<qty) throw new Error("สินค้าไม่เพียงพอ: "+row[1]);
      total+=price*qty; updates.push({row:idx+2,stock:stock-qty});
      item.name=String(row[1]); item.price=price;
    });
    updates.forEach(u=>ps.getRange(u.row,4).setValue(u.stock));
    const id="HH"+Utilities.formatDate(new Date(),Session.getScriptTimeZone(),"yyyyMMddHHmmss")+"-"+Math.floor(Math.random()*900+100);
    sh.appendRow([id,new Date(),order.customerName,order.phone,order.address,order.note||"",JSON.stringify(order.items),total,"รอแพ็กสินค้า"]);
    return {ok:true,orderId:id,total:total};
  } finally { lock.releaseLock(); }
}
function listOrders_() {
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS);
  if(!sh) throw new Error("ไม่พบชีต Orders");
  const v=sh.getDataRange().getValues(), rows=v.slice(1).reverse();
  return {ok:true,orders:rows.map(r=>({orderId:r[0],createdAt:r[1] instanceof Date?Utilities.formatDate(r[1],Session.getScriptTimeZone(),"yyyy-MM-dd HH:mm"):r[1],customerName:r[2],phone:r[3],address:r[4],note:r[5],items:r[6],total:r[7],status:r[8]}))};
}
function updateStatus_(id,status) {
  const allowed=["รอแพ็กสินค้า","กำลังแพ็ก","จัดส่งแล้ว","ยกเลิก"];
  if(!allowed.includes(status)) throw new Error("สถานะไม่ถูกต้อง");
  const sh=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS), values=sh.getDataRange().getValues();
  for(let i=1;i<values.length;i++) if(String(values[i][0])===String(id)){sh.getRange(i+1,9).setValue(status);return {ok:true};}
  throw new Error("ไม่พบคำสั่งซื้อ");
}
function authorized_(token) { return !!token && token === PropertiesService.getScriptProperties().getProperty("ADMIN_TOKEN"); }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
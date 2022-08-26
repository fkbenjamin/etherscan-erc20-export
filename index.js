const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var date = Date.now()
// TODO: add address
let address = ''
const csvWriter = createCsvWriter({
    path: address + '-' + date + '.csv',
    header: [
      {id: 'blockNumber', title: 'blockNumber'},
      {id: 'timeStamp', title: 'timeStamp'},
      {id: 'hash', title: 'hash'},
      {id: 'from', title: 'from'},
      {id: 'to', title: 'to'},
      {id: 'value', title: 'value'},
      {id: 'tokenSymbol', title: 'tokenSymbol'},
    ]
  });

let data = []
API_URL = "https://api.etherscan.io/api"
// TODO: add API KEY
API_KEY = ''

async function getERC20Tx(address, startblock, endblock) {
    let res = await axios.get(API_URL + '?module=account&action=tokentx&address=' + address + '&startblock=' + startblock + "&endblock=" + endblock + "&sort=asc&apikey=" + API_KEY)
    let tx = res.data.result
    if(res.data.result.length === 10000) {
        console.log("Grabbing further ERC20 Transactions from BlockNo", res.data.result[9999].blockNumber)
        let add = await getERC20Tx(address, res.data.result[9999].blockNumber, endblock) 
        console.log(add.length)
        tx = tx.concat(add)
    }
    return tx
}

async function main(address) {
    let transactions = await getERC20Tx(address, 0, null)
    console.log("Found", transactions.length, "transactions from block", transactions[0].blockNumber, "to block", transactions[transactions.length - 1].blockNumber)
    transactions.forEach(tx => {
        data.push({blockNumber: tx.blockNumber,timeStamp: tx.timeStamp, hash: tx.hash, from: tx.from, to: tx.to, value: tx.value/10**tx.tokenDecimal, tokenSymbol: tx.tokenSymbol  })
    });
    console.log(data.length, "transactions to be written to CSV")
    csvWriter
  .writeRecords(data)
  .then(()=> console.log('The CSV file was written successfully'));
}

main(address)
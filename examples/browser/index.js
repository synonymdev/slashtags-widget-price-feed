import { parse, decode, encode } from '@synonymdev/slashtags-url';
import b4a from 'b4a';
import SDK from '@synonymdev/slashtags-sdk';

async function main() {
  const priceFeedURL = parse('slashfeed:qz51ssefys3uhiq3ghg1rtjtyfpqd1a4i9qrxeyx1b9gg4h91jyo#encryptionKey=nds189gg3hgpei45y79f9ho6s6yh4sm3su1bw4yktt9gtggxtxty');
  const sdk = new SDK({ relay: 'ws://localhost:45475' });
  console.log('Connecting to relay at :45475...');

  const watcher = sdk.drive(priceFeedURL.key, { encryptionKey: decode(priceFeedURL.privateQuery.encryptionKey) });
  await watcher.update();
  console.log('Watching shashfeed:' + encode(priceFeedURL.key) + '...');


  watcher.core.on('append', async () => {
    const priceLast = await watcher.get('/feed/BTCUSD-last')
    const priceString = b4a.toString(priceLast);
    console.log('Latest price:', priceString);
    showPrice(JSON.parse(priceString))
  });
}

function showPrice([timestamp, price, signature]) {
  // Get a reference to the timestamp <p> element
  var timestampElement = document.querySelector(".column:nth-child(1) p");

  // Convert the timestamp to a human-readable date
  var timestampDate = new Date(Number(timestamp));
  timestampElement.innerHTML = timestampDate.toString();

  // Get a reference to the price <p> element
  var priceElement = document.querySelector(".column:nth-child(2) p");

  // Set the price value
  priceElement.innerHTML = price;

  // Get a reference to the signature <p> element
  var signatureElement = document.querySelector(".column:nth-child(3) p");

  // Set the signature value
  signatureElement.innerHTML = signature;
  signatureElement.nodeValue = signature;
}

main();

const cheerio = require("cheerio");
const axios = require("axios");
const fs = require("fs");

// const purchaseUrl = `https://www.rightmove.co.uk/property-for-sale/find.html?minBedrooms=3&maxBedrooms=3&keywords=&sortType=2&viewType=LIST&channel=BUY&index=${index}&radius=0.0&locationIdentifier=USERDEFINEDAREA%5E%7B%22id%22%3A%226850088%22%7D`;

// warrick url rent = https://www.rightmove.co.uk/property-to-rent/find.html?keywords=&sortType=2&viewType=LIST&channel=RENT&index=${index}&radius=0.0&locationIdentifier=USERDEFINEDAREA%5E%7B%22polylines%22%3A%22ofs%7EHdxuHivAk%7C%40%7Dk%40_Soa%40yjAs%5BqyB%60G_qBrc%40_rCfmAqgBvyAuEhiAjoBvt%40zmGkqCvkG%22%7D
// birmingham url purchase = https://www.rightmove.co.uk/property-for-sale/find.html?minBedrooms=3&maxBedrooms=3&keywords=&sortType=2&viewType=LIST&channel=BUY&index=0&radius=0.0&locationIdentifier=USERDEFINEDAREA%5E%7B%22id%22%3A%226852065%22%2C+%22polylines%22%3A%22oed_IltrJhsAsNjd%40doEgq%40jkBkz%40feAmiAk_Aa%5Eo%7BB%7Ca%40yoCf%5Ccf%40f%5Cr%40%22%7D
// warrick url purchase = https://www.rightmove.co.uk/property-for-sale/find.html?minBedrooms=3&maxBedrooms=3&keywords=&sortType=2&viewType=LIST&channel=BUY&index=${index}&radius=0.0&locationIdentifier=USERDEFINEDAREA%5E%7B%22id%22%3A%226850088%22%7D

const getRentPricesByPage = async (page) => {
  const index = page * 24;

  const {data} = await axios({
    method: 'GET',
    url: `https://www.rightmove.co.uk/property-to-rent/find.html?keywords=&sortType=2&viewType=LIST&channel=RENT&index=${index}&radius=0.0&locationIdentifier=USERDEFINEDAREA%5E%7B%22polylines%22%3A%22ofs%7EHdxuHivAk%7C%40%7Dk%40_Soa%40yjAs%5BqyB%60G_qBrc%40_rCfmAqgBvyAuEhiAjoBvt%40zmGkqCvkG%22%7D`
  })

  const $ = cheerio.load(data);

  const priceCards = $('.propertyCard-priceValue').text();

  const dirtyData = priceCards.split(' ').filter((e) => e.includes('£'));

  const pricesArray = dirtyData.map((d) => {
    if (d.includes('pcm')) {
      return d.split('pcm')[1].split('£')[1];
    } else {
      return d.split('£')[1];
    }
  });

  const prices = pricesArray.map((p) => {
    const ar = p.split(',');
    return `${ar[0]}${ar[1]}`;
  })

  return prices;
}

const getPurchasePricesByPage = async (page) => {
  const index = page * 24;

  const {data} = await axios({
    method: 'GET',
    url: `https://www.rightmove.co.uk/property-for-sale/find.html?minBedrooms=3&maxBedrooms=3&keywords=&sortType=2&viewType=LIST&channel=BUY&index=${index}&radius=0.0&locationIdentifier=USERDEFINEDAREA%5E%7B%22id%22%3A%226852065%22%2C+%22polylines%22%3A%22oed_IltrJhsAsNjd%40doEgq%40jkBkz%40feAmiAk_Aa%5Eo%7BB%7Ca%40yoCf%5Ccf%40f%5Cr%40%22%7D`
  })

  const $ = cheerio.load(data);

  const priceCards = $('.propertyCard-priceValue').text();

  const dirtyData = priceCards.split(' ').filter((e) => e.includes('£'));

  const pricesArray = dirtyData.map((d) => {
    if (d.includes('pcm')) {
      return d.split('pcm')[1].split('£')[1];
    } else {
      return d.split('£')[1];
    }
  });

  const prices = pricesArray.map((p) => {
    const ar = p.split(',');
    return `${ar[0]}${ar[1]}`;
  })

  return prices;
}

const getRentalPrices = async (pages) => {

  let stringPrices = [];

  for (i = 0; i <= pages; i++) {
    const pagePrices = await getRentPricesByPage(i);
    stringPrices.push(...pagePrices);
  }

  const prices = stringPrices.map((p) => parseInt(p));

  return prices;
}

const getPurchasePrices = async (pages) => {

  let stringPrices = [];

  for (i = 0; i <= pages; i++) {
    const pagePrices = await getPurchasePricesByPage(i);
    stringPrices.push(...pagePrices);
  }

  const prices = stringPrices.map((p) => parseInt(p));

  return prices;
}

const getAveragePrice = (ar) => {
  let sum = 0;

  for (i = 0; i < ar.length; i++) {
    const price = ar[i];

    sum = sum + price;
  }

  return Math.floor(sum / ar.length);
}

const runApp = async () => {
  let numberOfPages = 30;

  const rentalPrices = await getRentalPrices(numberOfPages);
  const purchasePrices = await getPurchasePrices(numberOfPages);
  
  const averageRentalPrice = getAveragePrice(rentalPrices);
  const averagePurchasePrice = getAveragePrice(purchasePrices);

  console.log('');
  console.log('');
  console.log('');
  
  console.log('--------------------------------- Rental Prices ---------------------------------');
  console.log(`Lowest: ${Math.min(...rentalPrices)}`);
  console.log(`Highest: ${Math.max(...rentalPrices)}`);
  console.log(`Average: ${averageRentalPrice}`);
  console.log('');
  console.log('--------------------------------- Purchase Prices ---------------------------------');
  console.log(`Lowest: ${Math.min(...purchasePrices)}`);
  console.log(`Highest: ${Math.max(...purchasePrices)}`);
  console.log(`Average: ${averagePurchasePrice}`);

  console.log('');
  console.log('');
  console.log('');

};

runApp();

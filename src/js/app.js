/**
 * Crypto Watch
 *
 * Get the spot price of Coinbase BTC and LTC value. Also check the value of a BTC and/or LTC address. Useful for paper wallets
 * Now you can get a qrcode of the address for easy refernce to receive
 *
 * Author: Brian Ouellette
 * Twitter: @Brian_Enders
 *
 */
var qrencode = require('qrcode');
var Vector2 = require('vector2');
var UI = require('ui');
var Clay = require('clay');
var sb = require('bitcoin');
var eth = require('ether');
var Settings = require('settings');
var clayConfig = require('config');
var clay = new Clay(clayConfig, null, { autoHandleEvents: false });

var Feature = require('platform/feature');
var ajax = require('ajax');

// Global UI 
var splashCard = new UI.Card();
var routesMenu = new UI.Menu();
var fail_bg = '#b30000';
 
var primary = '#111111';
var secondary = '#DDDDDD';

var prices = [];
var wallets = [];
                               
// Gets this all going
loadPrices();

function displaySplashScreen(message, bg_color){
  
  // Text element to inform user
  splashCard = new UI.Card({
    status: {
      separator: 'none',
    },
    title: message,
    titleColor:'#FFFFFF',
    textAlign:'center',
    backgroundColor: Feature.color(bg_color, 'black')
  });
  
  splashCard.show();
}


/**
 * Builds a menu item with routes data
 * @param data for menu
 */
function displayStuff(){
  // Construct Menu to show to user
	
	var menuView = [];
	
	if(wallets.length > 0)
	{
    var priceAmount, fixAmount, displayAmount;
		switch(wallets[0].base) {
			case "BTC":
				priceAmount = prices[0].amount;
				displayAmount = sb.toBitcoin(wallets[0].balance);
				break;
			case "LTC":
				priceAmount = prices[1].amount;
				displayAmount = sb.toBitcoin(wallets[0].balance);
				break;
			case "BCH":
				priceAmount = prices[2].amount;
				displayAmount = sb.toBitcoin(wallets[0].balance);
				break;
			case "ETH":
				priceAmount = prices[3].amount;
				displayAmount = eth.toEther(wallets[0].balance);
				break;
		}
		fixAmount = priceAmount * displayAmount;
		menuView.push({
			subtitle:displayAmount+" "+(wallets[0].base),
			title:parseFloat(fixAmount).toFixed(2)
		});
	}
	
	if(wallets.length > 1)
	{
    var priceAmount, fixAmount, displayAmount;
		switch(wallets[1].base) {
			case "BTC":
				priceAmount = prices[0].amount;
				displayAmount = sb.toBitcoin(wallets[1].balance);
				break;
			case "LTC":
				priceAmount = prices[1].amount;
				displayAmount = sb.toBitcoin(wallets[1].balance);
				break;
			case "BCH":
				priceAmount = prices[2].amount;
				displayAmount = sb.toBitcoin(wallets[1].balance);
				break;
			case "ETH":
				priceAmount = prices[3].amount;
				displayAmount = eth.toEther(wallets[1].balance);
				break;
		}
		fixAmount = priceAmount * displayAmount;
		menuView.push({
			subtitle:displayAmount+" "+(wallets[1].base),
			title:parseFloat(fixAmount).toFixed(2)
		});
	}
	
	if(wallets.length > 2)
	{
    var priceAmount, fixAmount, displayAmount;
		switch(wallets[2].base) {
			case "BTC":
				priceAmount = prices[0].amount;
				displayAmount = sb.toBitcoin(wallets[2].balance);
				break;
			case "LTC":
				priceAmount = prices[1].amount;
				displayAmount = sb.toBitcoin(wallets[2].balance);
				break;
			case "BCH":
				priceAmount = prices[2].amount;
				displayAmount = sb.toBitcoin(wallets[2].balance);
				break;
			case "ETH":
				priceAmount = prices[3].amount;
				displayAmount = eth.toEther(wallets[2].balance);
				break;
		}
		fixAmount = priceAmount * displayAmount;
		menuView.push({
			subtitle:displayAmount+" "+(wallets[2].base),
			title:parseFloat(fixAmount).toFixed(2)
		});
	}
	
	if(wallets.length > 3)
	{
    var priceAmount, fixAmount, displayAmount;
		switch(wallets[3].base) {
			case "BTC":
				priceAmount = prices[0].amount;
				displayAmount = sb.toBitcoin(wallets[3].balance);
				break;
			case "LTC":
				priceAmount = prices[1].amount;
				displayAmount = sb.toBitcoin(wallets[3].balance);
				break;
			case "BCH":
				priceAmount = prices[2].amount;
				displayAmount = sb.toBitcoin(wallets[3].balance);
				break;
			case "ETH":
				priceAmount = prices[3].amount;
				displayAmount = eth.toEther(wallets[3].balance);
				break;
		}
		
		fixAmount = priceAmount * displayAmount;
		menuView.push({
			subtitle:displayAmount+" "+(wallets[3].base),
			title:parseFloat(fixAmount).toFixed(2)
		});
	}
		
	menuView.push({
		title:prices[0].amount,
		icon:'images/btcicon.png',
		subtitle:prices[0].currency+" Coinbase"
	});

	menuView.push({
		title:prices[1].amount,
		icon:'images/ltcicon.png',
		subtitle:prices[1].currency+" Coinbase"
	});

	menuView.push({
		title:prices[2].amount,
		icon:'images/bchicon.png',
		subtitle:prices[2].currency+" Coinbase"
	});
	
	menuView.push({
		title:prices[3].amount,
		icon:'images/ethicon.png',
		subtitle:prices[3].currency+" Coinbase"
	});

	
  // Add data & style to menu
  routesMenu = new UI.Menu({
    status: {
      separator: 'none',
    },
    backgroundColor: Feature.color(primary, 'black'),
    highlightBackgroundColor: Feature.color(secondary, 'white'),
    textColor: Feature.color(secondary, 'white'),
    highlightTextColor: Feature.color('#222222', 'black'),
    sections: [{
      items: menuView
    }]
  });

  // Show the Menu, hide the splash
	
	routesMenu.on('select', function(e) {
		if(wallets.length > 0)
		{
			if(e.itemIndex == 0)
			{
				
				var code = qrencode.encodeString(wallets[0].address, 0, qrencode.QR_ECLEVEL_L, qrencode.QR_MODE_8, true);
				var length = code.length;
				var res = Feature.resolution();
				var qrsize = length*2;
				var start = res.x/2-qrsize;
				
				var walletView = new UI.Window({
					backgroundColor: 'white'
				});
        var textfield = new UI.Text({
					position: new Vector2(res.x/2-70, res.x/2+qrsize),
          size: new Vector2(140, 60),
          font: 'gothic-14',
					color: 'black',
          text: wallets[0].address,
          textAlign: 'center'
        });

				for (var y=0; y<length; y++) {
					for (var x=0; x<length; x++) {
						var rect = new UI.Rect({ 
							position: new Vector2(start+x*4, start+y*4),
							size: new Vector2(4, 4),
							backgroundColor: code[y][x] ? "black" : "white"
						});

						walletView.add(rect);
						walletView.add(textfield);
					}
				}
				walletView.show();
			}
			
			if(wallets.length > 1 && e.itemIndex == 1)
			{

				var code = qrencode.encodeString(wallets[1].address, 0, qrencode.QR_ECLEVEL_L, qrencode.QR_MODE_8, true);
				var length = code.length;
				var res = Feature.resolution();
				var qrsize = length*2;
				var start = res.x/2-qrsize;
				
				var walletView = new UI.Window({
					backgroundColor: 'white'
				});
        var textfield = new UI.Text({
					position: new Vector2(res.x/2-70, res.x/2+qrsize),
          size: new Vector2(140, 60),
          font: 'gothic-14',
					color: 'black',
          text: wallets[1].address,
          textAlign: 'center'
        });

				for (var y=0; y<length; y++) {
					for (var x=0; x<length; x++) {
						var rect = new UI.Rect({ 
							position: new Vector2(start+x*4, start+y*4),
							size: new Vector2(4, 4),
							backgroundColor: code[y][x] ? "black" : "white"
						});

						walletView.add(rect);
						walletView.add(textfield);
						
					}
				}
				walletView.show();
			}
			
			if(wallets.length > 2 && e.itemIndex == 2)
			{

				var code = qrencode.encodeString(wallets[2].address, 0, qrencode.QR_ECLEVEL_L, qrencode.QR_MODE_8, true);
				var length = code.length;
				var res = Feature.resolution();
				var qrsize = length*2;
				var start = res.x/2-qrsize;
				
				var walletView = new UI.Window({
					backgroundColor: 'white'
				});
        var textfield = new UI.Text({
					position: new Vector2(res.x/2-70, res.x/2+qrsize),
          size: new Vector2(140, 60),
          font: 'gothic-14',
					color: 'black',
          text: wallets[2].address,
          textAlign: 'center'
        });

				for (var y=0; y<length; y++) {
					for (var x=0; x<length; x++) {
						var rect = new UI.Rect({ 
							position: new Vector2(start+x*4, start+y*4),
							size: new Vector2(4, 4),
							backgroundColor: code[y][x] ? "black" : "white"
						});

						walletView.add(rect);
						walletView.add(textfield);
						
					}
				}
				walletView.show();
			}
			
			if(wallets.length > 3 && e.itemIndex == 3)
			{

				var code = qrencode.encodeString(wallets[3].address, 0, qrencode.QR_ECLEVEL_L, qrencode.QR_MODE_8, true);
				var length = code.length;
				var res = Feature.resolution();
				var qrsize = length*2;
				var start = res.x/2-qrsize;
				
				var walletView = new UI.Window({
					backgroundColor: 'white'
				});
        var textfield = new UI.Text({
					position: new Vector2(res.x/2-70, res.x/2+qrsize),
          size: new Vector2(140, 60),
          font: 'gothic-14',
					color: 'black',
          text: wallets[3].address,
          textAlign: 'center'
        });

				for (var y=0; y<length; y++) {
					for (var x=0; x<length; x++) {
						var rect = new UI.Rect({ 
							position: new Vector2(start+x*4, start+y*4),
							size: new Vector2(4, 4),
							backgroundColor: code[y][x] ? "black" : "white"
						});

						walletView.add(rect);
						walletView.add(textfield);
						
					}
				}
				walletView.show();
			}
		}
	});
	
  routesMenu.show();
  splashCard.hide(); 
}

function loadPrices(){
  displaySplashScreen('Downloading Data...', primary);
	var currency = Settings.option("KEY_EXCHANGE_CUR") == null ? "USD" : Settings.option("KEY_EXCHANGE_CUR");
  var getPrices = "https://api.coinbase.com/v2/prices/"+currency+"/spot";
	
  ajax(
    {
      url: getPrices,
      type: 'json'
    },
    function(data) {
      // Success
			
		for(d in data.data){
			switch(data.data[d].base){
				case "BTC":
					prices[0]={
						base:data.data[d].base,
						amount:data.data[d].amount,
						currency:data.data[d].currency
					};
					break;
				case "LTC":
					prices[1]={
						base:data.data[d].base,
						amount:data.data[d].amount,
						currency:data.data[d].currency
					};
					break;
				case "BCH":
					prices[2]={
						base:data.data[d].base,
						amount:data.data[d].amount,
						currency:data.data[d].currency
					};         
					break;
				case "ETH":
					prices[3]={
						base:data.data[d].base,
						amount:data.data[d].amount,
						currency:data.data[d].currency
					};         
					break;           
			}
		}
			
		loadBTCWallet();
			
    },
    function(error) {
      // Failure!
      displaySplashScreen('Failed to load Prices.', fail_bg);
    }
  );
}

function loadBTCWallet(){
	var balanceBTCUrl = "https://api.blockcypher.com/v1/btc/main/addrs/"+Settings.option("KEY_BTC_ADDRESS_1")+"/balance";
	if(Settings.option("KEY_BTC_ADDRESS_1") != null && Settings.option("KEY_BTC_ADDRESS_1") != "")
	{
		ajax(
			{
				url: balanceBTCUrl,
				type: 'json'
			},
			function(data) {
				// Success

				wallets.push({
					balance:data.final_balance,
					address:data.address,
					base:"BTC"
				});

				loadLTCWallet();
			},
			function(error) {
				// Failure!
				displaySplashScreen('Failed to load BTC Wallet.', fail_bg);
			}
		);
	}else{
		loadLTCWallet();
	}
}

function loadLTCWallet(){
	var balanceLTCUrl = "https://api.blockcypher.com/v1/ltc/main/addrs/"+Settings.option("KEY_LTC_ADDRESS_1")+"/balance";
	
	if(Settings.option("KEY_LTC_ADDRESS_1") != null && Settings.option("KEY_LTC_ADDRESS_1") != "")
	{
		ajax(
			{
				url: balanceLTCUrl,
				type: 'json'
			},
			function(data) {
				// Success
				wallets.push({
					balance:data.final_balance,
					address:data.address,
					base:"LTC"
				});

				loadBCHWallet();
			},
			function(error) {
				// Failure!
				displaySplashScreen('Failed to load LTC Wallet.', fail_bg);
			}
		);
	}else{
		loadBCHWallet(); 
	}
}

function loadBCHWallet(){
	var balanceBCHUrl = "https://blockdozer.com/insight-api/addr/"+Settings.option("KEY_BCH_ADDRESS_1");
	
	if(Settings.option("KEY_BCH_ADDRESS_1") != null && Settings.option("KEY_BCH_ADDRESS_1") != "")
	{
		ajax(
			{
				url: balanceBCHUrl,
				type: 'json'
			},
			function(data) {
				// Success
				wallets.push({
					balance:data.balanceSat,
					address:data.addrStr,
					base:"BCH"
				});

				loadETHWallet();
			},
			function(error) {
				// Failure!
				displaySplashScreen('Failed to load BCH Wallet.', fail_bg);
			}
		);
	}else{
		loadETHWallet();
	}
}

function loadETHWallet(){
	var balanceETHUrl = "https://api.etherscan.io/api?module=account&action=balance&address="+Settings.option("KEY_ETH_ADDRESS_1")+"&tag=latest&apikey=XAPM9HS38MRV8D1UXXZSWHVYMX9FBQ38C2";
	console.log(balanceETHUrl);
	if(Settings.option("KEY_ETH_ADDRESS_1") != null && Settings.option("KEY_ETH_ADDRESS_1") != "")
	{
		ajax(
			{
				url: balanceETHUrl,
				type: 'json'
			},
			function(data) {
				
				// Success
				wallets.push({
					balance:data.result,
					address:Settings.option("KEY_ETH_ADDRESS_1"),
					base:"ETH"
				});

				displayStuff();
			},
			function(error) {
				// Failure!
				displaySplashScreen('Failed to load ETH Wallet.', fail_bg);
			}
		);
	}else{
		displayStuff();
	}
}
  
Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e && !e.response) {
    return;
  }
  var dict = clay.getSettings(e.response);
  Settings.option(dict);
	prices = [];
  wallets = [];
	routesMenu.hide();
  splashCard.hide();
	loadPrices();
});
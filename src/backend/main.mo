import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Random "mo:core/Random";


actor {
  // Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Invite Links System State
  let inviteState = InviteLinksModule.initState();

  // Data Models
  type Stock = {
    symbol : Text;
    name : Text;
    price : Float;
    dailyChangePercent : Float;
  };

  type PortfolioEntry = {
    stock : Stock;
    quantity : Nat;
    buyPrice : Float;
  };

  type Transaction = {
    stock : Stock;
    quantity : Nat;
    price : Float;
    timestamp : Int;
    transactionType : Text;
  };

  type MarketIndex = {
    name : Text;
    value : Float;
    dailyChangePercent : Float;
  };

  type User = {
    holdings : [PortfolioEntry];
    transactionHistory : [Transaction];
    balance : Float;
  };

  public type UserProfile = {
    name : Text;
  };

  module Stock {
    public func compare(stock1 : Stock, stock2 : Stock) : Order.Order {
      Text.compare(stock1.symbol, stock2.symbol);
    };
  };

  module Transaction {
    public func compareByTimestamp(transaction1 : Transaction, transaction2 : Transaction) : Order.Order {
      Int.compare(transaction1.timestamp, transaction2.timestamp);
    };
  };

  // Persistent Storage
  let users = Map.empty<Principal, User>();
  let stocks = Map.empty<Text, Stock>();
  let marketIndices = Map.empty<Text, MarketIndex>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Admin wallet balance (starts with 50,000 rupees to distribute as invite bonuses)
  var adminWalletBalance : Float = 50000.0;

  // Invite bonus amount
  let INVITE_BONUS : Float = 200.0;

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Initialization
  public shared ({ caller }) func initialize() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can initialize the market");
    };

    let initialStocks : [(Text, Stock)] = [
      ("RELIANCE", { symbol = "RELIANCE"; name = "Reliance Industries"; price = 2500.0; dailyChangePercent = 0.0 }),
      ("INFY", { symbol = "INFY"; name = "Infosys"; price = 1500.0; dailyChangePercent = 0.0 }),
      ("TCS", { symbol = "TCS"; name = "Tata Consultancy Services"; price = 3200.0; dailyChangePercent = 0.0 }),
      ("HDFC", { symbol = "HDFC"; name = "HDFC Bank"; price = 1400.0; dailyChangePercent = 0.0 }),
      ("ICICI", { symbol = "ICICI"; name = "ICICI Bank"; price = 1250.0; dailyChangePercent = 0.0 }),
    ];

    let initialIndices : [(Text, MarketIndex)] = [
      ("NIFTY50", { name = "Nifty 50"; value = 16000.0; dailyChangePercent = 0.0 }),
      ("SENSEX", { name = "Sensex"; value = 52000.0; dailyChangePercent = 0.0 }),
    ];

    for ((symbol, stock) in initialStocks.values()) {
      stocks.add(symbol, stock);
    };

    for ((name, index) in initialIndices.values()) {
      marketIndices.add(name, index);
    };
  };

  public shared ({ caller }) func addStock(stock : Stock) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add stocks");
    };
    stocks.add(stock.symbol, stock);
  };

  // User Functions
  public query ({ caller }) func getUserPortfolio() : async [PortfolioEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access portfolios");
    };
    switch (users.get(caller)) {
      case (?user) { user.holdings };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getPortfolio(user : Principal) : async [PortfolioEntry] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own portfolio");
    };
    switch (users.get(user)) {
      case (?user) { user.holdings };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getUserBalance() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access balance");
    };
    switch (users.get(caller)) {
      case (?user) { user.balance };
      case (null) { 0.0 };
    };
  };

  public query ({ caller }) func getBalance(user : Principal) : async Float {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own balance");
    };
    switch (users.get(user)) {
      case (?user) { user.balance };
      case (null) { 0.0 };
    };
  };

  public query ({ caller }) func getUserTransactionHistory() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access transaction history");
    };
    switch (users.get(caller)) {
      case (?user) { user.transactionHistory };
      case (null) { [] };
    };
  };

  public query ({ caller }) func getTransactionHistory(user : Principal) : async [Transaction] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transaction history");
    };
    switch (users.get(user)) {
      case (?user) { user.transactionHistory };
      case (null) { [] };
    };
  };

  // Admin wallet functions
  public query ({ caller }) func getAdminWalletBalance() : async Float {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view admin wallet");
    };
    adminWalletBalance;
  };

  public shared ({ caller }) func topUpAdminWallet(amount : Float) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can top up admin wallet");
    };
    if (amount <= 0.0) {
      Runtime.trap("Amount must be greater than 0");
    };
    adminWalletBalance := adminWalletBalance + amount;
  };

  // Market Data Functions
  public query ({ caller }) func getAllStocks() : async [Stock] {
    stocks.values().toArray().sort();
  };

  public query ({ caller }) func getStock(symbol : Text) : async ?Stock {
    stocks.get(symbol);
  };

  public query ({ caller }) func getAllMarketIndices() : async [MarketIndex] {
    marketIndices.values().toArray();
  };

  public query ({ caller }) func getMarketIndex(name : Text) : async ?MarketIndex {
    marketIndices.get(name);
  };

  public query ({ caller }) func getTotalUserCount() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access user statistics");
    };
    users.size();
  };

  public query ({ caller }) func getTotalTradeVolume() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access trade statistics");
    };
    users.values().toArray().foldLeft(
      0,
      func(total, user) {
        let userVolume = user.transactionHistory.foldLeft(
          0,
          func(acc, transaction) { acc + transaction.quantity },
        );
        total + userVolume;
      },
    );
  };

  // Trading Functions
  public shared ({ caller }) func buyStock(symbol : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can trade stocks");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let stock = switch (stocks.get(symbol)) {
      case (?stock) { stock };
      case (null) { Runtime.trap("Stock not found") };
    };

    let totalCost = stock.price * quantity.toFloat();
    let user = switch (users.get(caller)) {
      case (?user) { user };
      case (null) {
        { holdings = []; transactionHistory = []; balance = 0.0 };
      };
    };

    if (user.balance < totalCost) {
      Runtime.trap("Insufficient balance");
    };

    let portfolioEntries = user.holdings.toVarArray<PortfolioEntry>();
    var isNewStock = true;
    for (i in Nat.range(0, portfolioEntries.size())) {
      if (portfolioEntries[i].stock.symbol == symbol) {
        let existingEntry = portfolioEntries[i];
        portfolioEntries[i] := {
          stock = existingEntry.stock;
          quantity = existingEntry.quantity + quantity;
          buyPrice = (existingEntry.buyPrice * existingEntry.quantity.toFloat() + stock.price * quantity.toFloat()) / (existingEntry.quantity + quantity).toFloat();
        };
        isNewStock := false;
      };
    };

    let updatedHoldings = if (isNewStock) {
      portfolioEntries.toArray().concat([{ stock; quantity; buyPrice = stock.price }]);
    } else {
      portfolioEntries.toArray();
    };

    let transaction = {
      stock;
      quantity;
      price = stock.price;
      timestamp = Time.now();
      transactionType = "BUY";
    };

    let updatedUser : User = {
      holdings = updatedHoldings;
      transactionHistory = user.transactionHistory.concat([transaction]);
      balance = user.balance - totalCost;
    };

    users.add(caller, updatedUser);
  };

  public shared ({ caller }) func sellStock(symbol : Text, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can trade stocks");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    let stock = switch (stocks.get(symbol)) {
      case (?stock) { stock };
      case (null) { Runtime.trap("Stock not found") };
    };

    let user = switch (users.get(caller)) {
      case (?user) { user };
      case (null) { Runtime.trap("User not found") };
    };

    var totalStockQuantity = 0;
    for (entry in user.holdings.values()) {
      if (entry.stock.symbol == symbol) {
        totalStockQuantity += entry.quantity;
      };
    };

    if (totalStockQuantity < quantity) {
      Runtime.trap("Insufficient stock quantity");
    };

    let remainingQuantity = totalStockQuantity - quantity;
    let updatedHoldings = if (remainingQuantity > 0) {
      let existingEntry = user.holdings.find(func(entry) { entry.stock.symbol == symbol });
      switch (existingEntry) {
        case (?entry) { [{ stock = entry.stock; quantity = remainingQuantity; buyPrice = entry.buyPrice }] };
        case (null) { [] };
      };
    } else { [] };

    let totalValue = stock.price * quantity.toFloat();

    let transaction = {
      stock;
      quantity;
      price = stock.price;
      timestamp = Time.now();
      transactionType = "SELL";
    };

    let updatedUser : User = {
      holdings = updatedHoldings.concat(user.holdings.filter(func(entry) { entry.stock.symbol != symbol }));
      transactionHistory = user.transactionHistory.concat([transaction]);
      balance = user.balance + totalValue;
    };

    users.add(caller, updatedUser);
  };

  // Invite Links System Functions

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  // Join with invite code: credits ₹200 to the new user from admin wallet
  public shared ({ caller }) func joinWithInvite(name : Text, inviteCode : Text) : async () {
    // Check if user already exists
    switch (users.get(caller)) {
      case (?_) { Runtime.trap("User already joined") };
      case (null) {};
    };

    // Validate invite code and submit RSVP
    InviteLinksModule.submitRSVP(inviteState, name, true, inviteCode);

    // Check admin wallet has enough
    if (adminWalletBalance < INVITE_BONUS) {
      Runtime.trap("Admin wallet insufficient to give invite bonus");
    };

    // Deduct from admin wallet
    adminWalletBalance := adminWalletBalance - INVITE_BONUS;

    // Create user with ₹200 welcome bonus
    let newUser : User = {
      holdings = [];
      transactionHistory = [];
      balance = INVITE_BONUS;
    };
    users.add(caller, newUser);

    // Save profile
    userProfiles.add(caller, { name });
  };

  public shared func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };
};

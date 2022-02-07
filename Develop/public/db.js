
   
let db;

// request for new db, budget database
const request = indexedDB.open("budgetDB", 1);

// create object store whenever a thing is update/change
request.onupgradeneeded = (event) => {
  console.log("this is working");
  db = event.target.result;
  // creating object store names budgetStore
  db.createObjectStore("budgetStore", { autoIncrement: true });
};

// logs the error
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// if successfull
request.onsuccess = (event) => {
  console.log("success");
  // whats the navigator
  if (navigator.onLine) {
    checkDB();
  }
};

const saveRecord = (record) => {
    console.log("Record Saved offline");
  // opens transaction to allow access to budget objectStore
  const transaction = db.transaction(["budgetStore"], "readwrite");
  // access buget object store
  const store = transaction.objectStore("budgetStore");
  // adds input (use spread, don't have to but we can)
  store.add(record);
};

function checkDB() {
  console.log("Checking of db executed");
  const transaction = db.transaction(["budgetStore"], "readwrite");
  const store = transaction.objectStore("budgetStore");
  const getAll = store.getAll();

  // onSuccess is event handler
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        // copied fetch from index.js
        method: "POST",
        // Converts javascript to json
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          // takes response and parses back native JS object
          return response.json();
        })
        .then(() => {
          const transaction = db.transaction(["budgetStore"], "readwrite");
          const store = transaction.objectStore("budgetStore");

          store.clear();
          console.log("Store cleared");
        });
    }
  };
}

// if not here, will not log offline request or clear cache when back online
window.addEventListener("online", checkDB);
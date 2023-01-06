//database setup
let adapter = new LocalStorage("SaritoryDB");
let SaritoryDB = low(adapter);

//luxon date package setup
const DateTime = luxon.DateTime;
const Interval = luxon.Interval;

//baseurl setup
const baseurl = window.location.origin;
// const baseurl = `${window.location.origin}/saritory`;

// getting tables from local storage
const usersDB = SaritoryDB.get('users');
const currLogin = SaritoryDB.get('currLogin');
const category = SaritoryDB.get('category');
const products = SaritoryDB.get('products');

// console.log(`userDB: ${usersDB}`);
console.log(`url: ${baseurl}`);

// Session Check
function check_session() {
    if (currLogin.value().length === 0) {
        Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Redirecting to login page...',
            showConfirmButton: false,
            timer: 1500
        }).then((result) => {
            // location.replace(`${baseurl}/saritory/src/pages/login-signup.html`);
			location.replace(`${baseurl}/src/pages/login-signup.html`);
        })
    }
}
window.onload = check_session();



/********************* INITIALIZATION ***********************/
const usernameElement = document.getElementById('username');
const storeNameElement = document.getElementById('storeName');
const logoutBtn = document.getElementById('logout');

const productTableBody = document.getElementById('product__tbody');
const emptyListDisplayed = document.getElementById('empty-product__display');

const usernameValue = currLogin.value()[0].username;
const storeIDValue = currLogin.value()[0].storeID;
const storeNameValue = currLogin.value()[0].storeName;

//get the list of own category on local storage
const categoryList = category.filter(data => data.storeID === storeIDValue).value();
//get the list of own products on local storage
const productList = products.filter(data => data.storeID === storeIDValue).value();

//gets the list of products that will expire within 30days
const nearExpirationList = productList.filter(element => getDateInterval(element.expiration) > 0 );


/*****************  EVENT LISTENER  ******************/
logoutBtn.addEventListener('click', () => {
    logout();
    Swal.fire({
        title:'Goodbye!',
        text:'Logout Successful',
        icon:'success',
		allowOutsideClick: false,
		allowEscapeKey: false,
	}).then((result) => {
        if (result.isConfirmed) {
            // location.replace(`${baseurl}/saritory/src/pages/login-signup.html`);
			location.replace(`${baseurl}/src/pages/login-signup.html`);
        }
    })
});




/*****************  UTILITY FUNCTION  ******************/
//remove data from currLogin and back to login page
const logout = () => currLogin.remove({ username: usernameValue }).write();

$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
});

function getDateInterval(expirationDate){
	const productExpiration = expirationDate;
	const validation = DateTime.fromISO(DateTime.now().plus({days: 30}))

	const start = DateTime.fromISO(productExpiration)
	const end = validation;

	const diff = end.diff(start,'days')
	return Math.floor(diff.toObject().days);
}

const getCategoryName = (categoryID) => {
	const categoryVal = category.filter(el => el.id == categoryID).value();
	const result = (categoryVal.length > 0)? categoryVal[0].category : '-';
	return result;
}



 //set the products list on product table
const loadProducts = (list, selectArea) => { 
	list.forEach(element => {
		const totalPrice = parseFloat(element.price) * parseFloat(element.quantity_current)
		//checks if expiration date is empty or not
		const ExpirationVal = (element.expiration)? DateTime.fromISO(element.expiration).toLocaleString(DateTime.DATE_MED) : '';
		const imageVal = (element.image)? element.image : `https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930`;
		const data = `
		<tr id="${element.id}">
			<td class="text-center align-middle"><img src="${imageVal}" width="100px"/></td>
			<td class="text-center align-middle">${element.product}</td>
			<td class="text-center align-middle">${getCategoryName(element.category)}</td>
			<td class="text-center align-middle">${element.price}</td>
			<td class="text-center align-middle">${element.quantity_current}</td>
			<td class="text-center align-middle">${totalPrice}</td>
			<td class="text-center align-middle">${ExpirationVal}</td>
		</tr>
		`;
		selectArea.innerHTML += data;
	});
 }


function onload_Function() {

    //title init 
    usernameElement.innerHTML = usernameValue + '<span><img src="../images/SARITORY.png" width="50" alt="" /></span>'; 
	storeNameElement.innerText = storeNameValue;

	//Product Table setup
	if (nearExpirationList.length > 0) {
		emptyListDisplayed.classList.add('d-none');
		loadProducts(nearExpirationList, productTableBody);
	}else{
		emptyListDisplayed.classList.remove('d-none');
	}

}

window.onload = onload_Function();

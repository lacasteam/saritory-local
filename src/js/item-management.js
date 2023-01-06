//database setup
let adapter = new LocalStorage("SaritoryDB");
let SaritoryDB = low(adapter);

//luxon date package setup
const DateTime = luxon.DateTime;

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
const productForm = document.getElementById('productForm');
const addProductBtn = document.getElementById('addProductBtn');
const productSaveBtn = document.getElementById('productSaveButton');
const productCancelBtn = document.getElementById('productCancelButton');
const productUpdateBtn = document.getElementById('productUpdateButton');
const productModal = document.getElementById('addProductModal');
const productModalLabel = document.getElementById('addProductModalLabel');
const productTableBody = document.getElementById('product__tbody');
const emptyListDisplayed = document.getElementById('empty-product__display');

const productNameElement = document.getElementById('productNameInput');
const productSelectCategory = document.getElementById('productSelectCategory');
const productPriceElement = document.getElementById('productPriceInput');
const productQuantityElement = document.getElementById('productQuantityInput');
const productExpirationElement = document.getElementById('productExpirationInput');
const productImageElement = document.getElementById('productImageInput');
const productImageContainer = document.getElementById("showProductImage");
const productCategoryError1 = document.getElementById('prodCategory-error1');
const productCategoryError2 = document.getElementById('prodCategory-error2');

const usernameValue = currLogin.value()[0].username;
const storeIDValue = currLogin.value()[0].storeID;
const storeNameValue = currLogin.value()[0].storeName;

//get the list of own category on local storage
const categoryList = category.filter(data => data.storeID === storeIDValue).value();
//get the list of own products on local storage
const productList = products.filter(data => data.storeID === storeIDValue).value();

//used for updating product, to get the current productID
let currIdForUpdate = 0;

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

//ADD PRODUCT BUTTON
addProductBtn.addEventListener('click', () => {
	addProductMode();
});

//SAVE PRODUCT BUTTON
productSaveBtn.addEventListener('click', () => {
	const productObj = addProductInputCheck()
    if (productObj.isSuccess) {
        addProduct(productObj.data)
		productModal.classList.remove("show")
        Swal.fire(
            'Successful!',
            productObj.msg,
            'success'
        ).then((result) => {
            location.reload();
        })
    }
});

//UPDATE PRODUCT BUTTON
productUpdateBtn.addEventListener('click', () => {
	const productObj = updateProductInputCheck(currIdForUpdate);
    if (productObj.isSuccess) {
        updateProduct(currIdForUpdate,
			productObj.product, 
			productObj.category, 
			productObj.price, 
			productObj.quantity_current, 
			productObj.expiration, 
			productObj.image
		);
		productModal.classList.remove("show")
        Swal.fire(
            'Successful!',
            productObj.msg,
            'success'
        ).then((result) => {
            location.reload();
        })
    }
});


/*****************  VALIDATION  ******************/
//add product input validation
const addProductInputCheck = () => {
	const productNameVal = productNameElement.value.trim();
	const productSelectCategoryVal = productSelectCategory.value.trim();
	const productPriceVal = productPriceElement.value.trim();
	const productQuantityVal = productQuantityElement.value.trim();
	const productExpirationVal = productExpirationElement.value.trim();
	const productImageVal = sessionStorage.getItem("productImage");

	let ctr = 0;

	//validate product name
	if (productNameVal === '') {
		productForm.classList.add("was-validated")
		ctr++;
	}else if (productSelectCategoryVal === '') {
		productForm.classList.add("was-validated")
		ctr++;
	}else if (productPriceVal === '' || parseFloat(productPriceVal) === 0) {
		productForm.classList.add("was-validated")
		ctr++;
	}else if (productQuantityVal === '' || parseFloat(productQuantityVal) === 0) {
		productForm.classList.add("was-validated")
		ctr++;
	}else {

		if (ctr === 0) {
			productForm.classList.remove("was-validated")
			return {
				isSuccess: true,
				msg: 'Product has been added',
				data: {
					id: Math.floor(Math.random() * Date.now()),
					product: productNameVal,
					category: productSelectCategoryVal,
					price: productPriceVal,
					quantity_current: productQuantityVal,
					quantity_total: productQuantityVal,
					expiration: productExpirationVal,
					image: productImageVal,
					storeID: storeIDValue
				}
			}
		} else {
			return {
				isSuccess: false,
				msg: 'Please check the fields error',
				data: null
			}
		}
	}
}

//update product input validation
const updateProductInputCheck = (id) => {
	const updatedProductName = productNameElement.value.trim();
	const updatedCategory = productSelectCategory.value.trim();
	const updatedPrice = productPriceElement.value.trim();
	const productQuantityVal = productQuantityElement.value.trim();
	const updatedExpiration = productExpirationElement.value.trim();
	const productImageVal = productImageElement.value.trim();
	const currentProduct = productList.filter(element => element.id === id);
	const updatedImage = (productImageVal === '')?  currentProduct[0].image : sessionStorage.getItem("productImage");

	let ctr = 0;

	//validate product name
	if (updatedProductName === '') {
		productForm.classList.add("was-validated")
		ctr++;
	}else if (updatedCategory === '') {
		productForm.classList.add("was-validated")
		ctr++;
	}else if (updatedPrice === '' || parseFloat(updatedPrice) === 0) {
		productForm.classList.add("was-validated")
		ctr++;
	}else if (productQuantityVal === '' || parseFloat(productQuantityVal) === 0) {
		productForm.classList.add("was-validated")
		ctr++;
	}else {

		if (ctr === 0) {
			productForm.classList.remove("was-validated")
			return {
				isSuccess: true,
				msg: 'Product has been updated',
				product: updatedProductName,
				category: updatedCategory,
				price: updatedPrice,
				quantity_current: productQuantityVal,
				expiration: updatedExpiration,
				image: updatedImage,
				
			}
		} else {
			return {
				isSuccess: false,
				msg: 'Please check the fields error',
				data: null
			}
		}
	}
}


/*****************  UTILITY FUNCTION  ******************/
//remove data from currLogin and back to login page
const logout = () => currLogin.remove({ username: usernameValue }).write();
//add product to local storage
const addProduct = (productObj) => products.push(productObj).write();
//delete product to local storage
const deleteProduct = (categoryID) => products.remove({ id: categoryID }).write();
//edit product on local storage
const updateProduct = (productID, updatedProductName, updatedCategory, updatedPrice, quantity, updatedExpiration, updatedImage) => {
	products.find({id:productID}).assign({
		product: updatedProductName,
		category: updatedCategory,
		price: updatedPrice,
		quantity_current: quantity,
		expiration: updatedExpiration,
		image: updatedImage
	}).write();
}

$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
});

//product add mode
const addProductMode = () => {
	productForm.classList.remove("was-validated");
	productNameElement.value = '';
	productSelectCategory.value = '';
	productPriceElement.value = '';
	productQuantityElement.value = '';
	productExpirationElement.value = '';
	productImageElement.value = '';
	productNameElement.disabled = false;
	productSelectCategory.disabled = false;
	productPriceElement.disabled = false;
	productQuantityElement.disabled = false;
	productExpirationElement.disabled = false;
	productImageElement.disabled = false;
	productPriceElement.classList.remove("is-invalid");
	productImageContainer.innerHTML = '';
	sessionStorage.setItem("productImage", '');
	productImageElement.classList.remove('d-none');
    productUpdateBtn.classList.add('d-none');
    productSaveBtn.classList.remove('d-none');
}

//product update mode
const updateProductMode = (id) => {
	productUpdateBtn.classList.remove('d-none');
    productSaveBtn.classList.add('d-none');
	const currentProduct = productList.filter(element => element.id === id);
	productModalLabel.innerText="View product";
	productNameElement.disabled = false;
	productNameElement.value = currentProduct[0].product;
	productSelectCategory.disabled = false;
	productSelectCategory.value = currentProduct[0].category;
	productPriceElement.disabled = false;
	productPriceElement.value = currentProduct[0].price;
	productQuantityElement.disabled = false;
	productQuantityElement.value = currentProduct[0].quantity_current;
	productExpirationElement.disabled = false;
	productExpirationElement.value = currentProduct[0].expiration;
	productImageElement.disabled = false;
	productImageElement.classList.remove('d-none');
	productImageElement.value = ''
	productImageContainer.innerHTML = `<img src="${currentProduct[0].image}" width="150px" class="d-block mx-auto py-3"></img>`
	currIdForUpdate = id;
}

//product delete mode
const deleteProductMode = (id) => {
	Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            //delete from storage
            deleteProduct(id);
            //checks if the list in empty
            if (productList.length < 1) {
                //display List empty icon
                emptyListDisplayed.classList.remove('d-none');
            }
            Swal.fire(
                'Deleted!',
                'Product has been deleted.',
                'success'
            ).then((result) => {
				location.reload();
			})
        }
    })
}

//product view mode
const viewProductMode = (id) => {
	productUpdateBtn.classList.add('d-none');
    productSaveBtn.classList.add('d-none');
	const currentProduct = productList.filter(element => element.id === id);
	productModalLabel.innerText="View product";
	productNameElement.disabled = true;
	productNameElement.value = currentProduct[0].product;
	productSelectCategory.disabled = true;
	productSelectCategory.value = currentProduct[0].category;
	productPriceElement.disabled = true;
	productPriceElement.value = currentProduct[0].price;
	productQuantityElement.disabled = true;
	productQuantityElement.value = currentProduct[0].quantity_current;
	productExpirationElement.disabled = true;
	productExpirationElement.value = currentProduct[0].expiration;
	productImageElement.disabled = true;
	productImageElement.classList.add('d-none');
	productImageContainer.innerHTML = `<img src="${currentProduct[0].image}" width="150px" class="d-block mx-auto py-3"></img>`
}

const getCategoryName = (categoryID) => {
	const categoryVal = category.filter(el => el.id == categoryID).value();
	if(categoryVal.length > 0){
		return categoryVal[0].category
	}else return '-';
}

//get image and save to sessionStorage
function getProductImage() {
	let reader = new FileReader();
	reader.addEventListener("load", function () {
		sessionStorage.setItem("productImage", reader.result);
		showImage();
		
	});
	
	reader.readAsDataURL(event.target.files[0]);
}
  // display image below the image field
function showImage() {
	let showimage = productImageContainer;
	let imageURL = sessionStorage.getItem("productImage");
	showimage.innerHTML = `<img src="${imageURL}" width="150px" class="d-block mx-auto py-3"></img>`
}

//set the category list on product modal
const loadCategory = (list, selectArea) => { 
	list.forEach(element => {
		const data = `<option value="${element.id}">${element.category}</option>`;
		selectArea.innerHTML += data;
	});
 }

 //set the products list on product modal
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
			
			<td class="align-middle">
				<div class="d-flex justify-content-center">
					<button type="button" class="btn btn-primary" data-bs-toggle="modal" 
					data-bs-target="#addProductModal" onclick="viewProductMode(${element.id})"><i class="far fa-eye"></i></button>
					<button type="button" class="btn btn-success mx-1" data-bs-toggle="modal" 
					data-bs-target="#addProductModal" onclick="updateProductMode(${element.id})"><i class="fas fa-edit"></i></button>
					<button type="button" class="btn btn-danger" onclick="deleteProductMode(${element.id})"><i class="far fa-trash-alt"></i></button>
				</div>
			</td>
		</tr>
		`;
		selectArea.innerHTML += data;
	});
 }


function onload_Function() {

    //title init 
    usernameElement.innerHTML = usernameValue + '<span><img src="../images/SARITORY.png" width="50" alt="" /></span>'; 
	storeNameElement.innerText = storeNameValue;

	//check if category list on local storage is not empty
	if (categoryList.length > 0) {
		productCategoryError1.classList.remove('d-none');
		productCategoryError2.classList.add('d-none');
		//load the category list to table
		loadCategory(categoryList, productSelectCategory);
	}else{
		productCategoryError1.classList.add('d-none');
		productCategoryError2.classList.remove('d-none');
	}

	//Product Table setup
	if (productList.length > 0) {
		emptyListDisplayed.classList.add('d-none');
		loadProducts(productList, productTableBody);
	}else{
		emptyListDisplayed.classList.remove('d-none');
	}

	// const filteredProducts = productList.filter(e => {
	// 	return (e.product).toLowerCase().includes('bear');
	// })
	// console.log(`filtered Results: ${JSON.stringify(filteredProducts[0].product)}`);

}

window.onload = onload_Function();

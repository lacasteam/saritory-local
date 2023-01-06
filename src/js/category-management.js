//database setup
let adapter = new LocalStorage("SaritoryDB");
let SaritoryDB = low(adapter);

const baseurl = window.location.origin;
// const baseurl = `${window.location.origin}/saritory`;
const usersDB = SaritoryDB.get('users');
const currLogin = SaritoryDB.get('currLogin');
const category = SaritoryDB.get('category');

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

// console.log(JSON.stringify(currLogin));

/********************* INITIALIZATION ***********************/
const usernameElement = document.getElementById('username');
const storeNameElement = document.getElementById('storeName');
const logoutBtn = document.getElementById('logout');
const categoryForm = document.getElementById('categoryForm');
const categoryElement = document.getElementById('categoryNameInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categorySaveBtn = document.getElementById('categorySaveButton');
const categoryCancelBtn = document.getElementById('categoryCancelButton');
const categoryUpdateBtn = document.getElementById('categoryUpdateButton');
const categoryModal = document.getElementById('addCategoryModal');
const categoryModalLabel = document.getElementById('addCategoryModalLabel');
const categoryTableBody = document.getElementById('category__tbody');
const emptyListDisplayed = document.getElementById('empty-category__display');

const usernameValue = currLogin.value()[0].username;
const storeIDValue = currLogin.value()[0].storeID;
const storeNameValue = currLogin.value()[0].storeName;

const categoryList = category.filter(data => data.storeID === storeIDValue).value();

//used for updating category, to get the current categoryID
let currIdForUpdate = 0;

/*****************  EVENT LISTENER  ******************/

//LOGOUT BUTTON
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

//ADD CATEGORY BUTTON
addCategoryBtn.addEventListener('click', () => {
	addCategoryMode();
});

//SAVE CATEGORY BUTTON
categorySaveBtn.addEventListener('click', () => {
	const categoryObj = addCategoryInputCheck()
    if (categoryObj.isSuccess) {
        addCategory(categoryObj.data)
		categoryModal.classList.remove("show")
        Swal.fire(
            'Successful!',
            categoryObj.msg,
            'success'
        ).then((result) => {
            location.reload();
        })
    }
});

//UPDATE CATEGORY BUTTON
categoryUpdateBtn.addEventListener('click', () => {
	const categoryObj = updateCategoryInputCheck(currIdForUpdate)
    if (categoryObj.isSuccess) {
        updateCategory(currIdForUpdate, categoryObj.updatedCategoryVal)
		categoryModal.classList.remove("show")
        Swal.fire(
            'Successful!',
            categoryObj.msg,
            'success'
        ).then((result) => {
            location.reload();
        })
    }
});


categoryCancelBtn.addEventListener('click', () => {
    console.log("cancel category clicked!");
});


/*****************  VALIDATION  ******************/
//add input validation
const addCategoryInputCheck = () => {
	const categoryVal = categoryElement.value.trim();
	let ctr = 0;
	if (categoryVal === '') {
		categoryElement.classList.add("is-invalid")
		ctr++;
	} else {
		if (ctr === 0) {
			categoryElement.classList.remove("is-invalid")
			return {
				isSuccess: true,
				msg: 'Category has been added',
				data: {
					id: Math.floor(Math.random() * Date.now()),
					category: categoryVal,
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

//update input validation
const updateCategoryInputCheck = (id) => {
	const categoryVal = categoryElement.value.trim();
	let ctr = 0;
	if (categoryVal === '') {
		categoryElement.classList.add("is-invalid")
		ctr++;
	} else {
		if (ctr === 0) {
			categoryElement.classList.remove("is-invalid")
			return {
				isSuccess: true,
				msg: 'Category has been updated',
				updatedCategoryVal: categoryVal
			}
		} else {
			return {
				isSuccess: false,
				msg: 'Please check the fields error'
			}
		}
	}
}







/*****************  UTILITY FUNCTION  ******************/
//remove data from currLogin and back to login page
const logout = () => currLogin.remove({ username: usernameValue }).write();
//add category to local storage
const addCategory = (categoryObj) => category.push(categoryObj).write();
//edit category on local storage
const updateCategory = (categoryID, updatedCategoryName) => category.find({id:categoryID}).assign({category:updatedCategoryName}).write();
//delete category to local storage
const deleteCategory = (categoryID) => category.remove({ id: categoryID }).write();


$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
});



//category add mode
const addCategoryMode = () => {
	categoryElement.value = '';
	categoryElement.disabled = false;
    categoryUpdateBtn.classList.add('d-none');
    categorySaveBtn.classList.remove('d-none');
}

//category edit mode
const updateCategoryMode = (id) => {
	categoryUpdateBtn.classList.remove('d-none');
    categorySaveBtn.classList.add('d-none');
	const currentCategory = categoryList.filter(element => element.id === id);
	categoryModalLabel.innerText="Update Category";
	categoryElement.disabled = false;
	categoryElement.value = currentCategory[0].category;
	currIdForUpdate = id;
}

const deleteCategoryMode = (id) => {
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
            deleteCategory(id);
            //checks if the list in empty
            if (categoryList.length < 1) {
                //display List empty icon
                emptyListDisplayed.classList.remove('d-none');
            }
            Swal.fire(
                'Deleted!',
                'Category has been deleted.',
                'success'
            ).then((result) => {
				location.reload();
			})
        }
    })
}

//category view mode
const viewCategoryMode = (id) => {
	categoryUpdateBtn.classList.add('d-none');
    categorySaveBtn.classList.add('d-none');
	const currentCategory = categoryList.filter(element => element.id === id);
	categoryModalLabel.innerText="View Category";
	categoryElement.disabled = true;
	categoryElement.value = currentCategory[0].category;
}

//display the category list
const loadCategory = (list, tableArea) => { 
	list.forEach(element => {
		const data = `
		<tr>
			<td>${element.category}</td>
			<td class="d-flex justify-content-center ">
				<button type="button" class="btn btn-primary" data-bs-toggle="modal" 
				data-bs-target="#addCategoryModal" onclick="viewCategoryMode(${element.id})"><i class="far fa-eye"></i></button>
				<button type="button" class="btn btn-success mx-1" data-bs-toggle="modal" 
				data-bs-target="#addCategoryModal" onclick="updateCategoryMode(${element.id})"><i class="fas fa-edit"></i></button>
				<button type="button" class="btn btn-danger" onclick="deleteCategoryMode(${element.id})"><i class="far fa-trash-alt"></i></button>
			</td>
		</tr>
		`
		tableArea.innerHTML += data;
	});
 }



// ONLOAD FUNCTION
function onload_Function() {

    //title init 
    usernameElement.innerHTML = usernameValue + '<span><img src="../images/SARITORY.png" width="50" alt="" /></span>'; 
	storeNameElement.innerText = storeNameValue;

	//check if category list on local storage is not empty
	if (categoryList.length > 0) {
		emptyListDisplayed.classList.add('d-none');
		//load the category list to table
		loadCategory(categoryList, categoryTableBody);
	}

}
window.onload = onload_Function();

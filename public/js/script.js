'use strict'

async function addCart(id, quantity) {
    //Gửi yêu cầu POST đến máy chủ
    let res = await fetch('/products/cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ id, quantity })
    });

    //Nhận phản hồi từ máy chủ dưới dạng JSON
    let json = await res.json();

    //Cập nhật số lượng sản phẩm trong giỏ hàng trên giao diện
    document.getElementById('cart-quantity').innerText = `(${json.quantity})`;
}

async function updateCart(id, quantity) {
    if (quantity > 0) {
        //Gửi yêu cầu PUT đến máy chủ
        let res = await fetch('/products/cart', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id, quantity })
        });
        if (res.status == 200) {
            //Nhận phản hồi từ máy chủ dưới dạng JSON
            let json = await res.json();

            //Cập nhật số lượng sản phẩm trong giỏ hàng trên giao diện
            document.getElementById('cart-quantity').innerText = `(${json.quantity})`;
            document.getElementById('subtotal').innerText = `${json.subtotal}`
            document.getElementById('total').innerText = `${json.total}`
            document.getElementById(`total${id}`).innerText = `${json.item.total}`
        }
    } else {
        removeCart(id);
    }
}

async function removeCart(id) {
    if (confirm('Do you really want to remove this product?')) {
        //Gửi yêu cầu DELETE đến máy chủ
        let res = await fetch('/products/cart', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        if (res.status == 200) {
            //Nhận phản hồi từ máy chủ dưới dạng JSON
            let json = await res.json();

            //Cập nhật số lượng sản phẩm trong giỏ hàng trên giao diện
            document.getElementById('cart-quantity').innerText = `(${json.quantity})`;
            if (json.quantity > 0) {
                document.getElementById('subtotal').innerText = `${json.subtotal}`
                document.getElementById('total').innerText = `${json.total}`
                document.getElementById(`product${id}`).remove();
            } else {
                document.querySelector('.cart-page .container').innerHTML = `<div class="text-center border py-3">
                <h3>Your cart is empty!</h3></div>`;
            }
        }
    }
}

async function clearCart() {
    if (confirm('Do you really want to clear all cart?')) {
        //Gửi yêu cầu đến máy chủ
        let res = await fetch('/products/cart/all', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        });
        if (res.status == 200) {
            //Cập nhật số lượng sản phẩm trong giỏ hàng trên giao diện
            document.getElementById('cart-quantity').innerText = `(0)`;
            document.querySelector('.cart-page .container').innerHTML = `<div class="text-center border py-3">
                <h3>Your cart is empty!</h3></div>`;
        }
    }
}

function placeorders(e) {
    e.preventDefault();

    const form = e.target;
    const addressIdInput = document.querySelector('input[name=addressId]:checked');
    const isNewAddress = !addressIdInput || addressIdInput.value === "0";

    if (isNewAddress && !form.checkValidity()) {
        form.reportValidity();
        return;
    }

    form.submit();
}

function checkPasswordConfirm(formId) {
    let password = document.querySelector(`#${formId} [name=password]`);
    let confirmPassword = document.querySelector(`#${formId} [name=confirmPassword]`);
    if (password.value != confirmPassword.value) {
        confirmPassword.setCustomValidity('Passwords not match!');
        confirmPassword.reportValidity();
    } else {
        confirmPassword.setCustomValidity('');
    }
}
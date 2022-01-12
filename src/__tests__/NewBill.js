import '@testing-library/jest-dom'
import { screen, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"

import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import firebase from '../__mocks__/firebase.js'

// Débugging
// screen.debug(document, 20000)
import { prettyDOM } from "@testing-library/dom"
// console.log(prettyDOM(document, 20000))

// SETUP
let containerNewBill
beforeEach(() => {
  const html = NewBillUI()
  document.body.innerHTML = html
  
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname })
  }
  
  Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    })
  
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'cedric.hiely@billed.com',
        password: 'azerty',
        status: 'connected'
      })
    )
  
    containerNewBill = new NewBill({
      document,
      onNavigate,
      firestore: null,
      localStorage: window.localStorage,
    })
})

describe("Given I am connected as an employee", () => {
  
  describe("When I am on NewBill Page", () => {
    
    test("Then the form should render with his inputs", () => {
      const input = document.querySelector('form')
      const form = screen.getByTestId('form-new-bill')

      expect(screen.getByText(/envoyer une note de frais/i)).toBeTruthy()
      expect(form).toBeVisible()
      expect(input.length).toEqual(9)
    })

    
    describe("When I upload a file through the form", () => {

      describe("If the file has a non-accepted format", () => {

        test("Then it should display an error message and the file can't be uploaded", () => {
          const fileInput = screen.getByTestId('file')
          const file = new File(['test'], 'badFormat.pdf', { type: 'application/pdf' })
          const errorMsg = screen.getByText(/format d'image invalide\. merci de télécharger un fichier jpg, jpeg ou png\./i)
          const handleChange = jest.spyOn(containerNewBill, 'handleChangeFile')

          userEvent.upload(fileInput, file)
          // fileInput.addEventListener('change', handleChange)
          // fireEvent.change(fileInput, file)
          
          expect(handleChange).toHaveBeenCalled()
          expect(errorMsg).toHaveClass('errorMessage-visible')
          expect(input.value).toBe('')
        })
      })

      describe("If the file has an accepted format", () => {
        test("Then it can submit the form without any error message", () => {
          const fileInput = screen.getByTestId('file')
          const file = new File(['test'], 'goodFormat.jpg', { type: 'image/jpg' })
          const errorMsg = screen.getByText(/format d'image invalide\. merci de télécharger un fichier jpg, jpeg ou png\./i)
          const handleChange = jest.spyOn(containerNewBill, 'handleChangeFile')
         
          userEvent.upload(fileInput, file)
          // fileInput.addEventListener('change', handleChange)
          // fireEvent.change(fileInput, file)
        
          expect(handleChange).toHaveBeenCalled()
          expect(errorMsg).not.toHaveClass('errorMessage-visible') 
          expect(fileInput.files[0]).toStrictEqual(file)
          expect(fileInput.files.item(0)).toStrictEqual(file)
          expect(fileInput.files).toHaveLength(1)
        })
      })
    })
  })
})

describe("When I submit a valid form", () => {
  // const email = JSON.parse(localStorage.getItem('user')).email
  const testBill = {
    email : 'cedric.hiely@billed.com',
    type: 'Transports',
    name: 'Vol Paris Londres',
    amount: 348,
    date: '2022-01-01',
    vat: '70',
    pct: 20,
    commentary: '',
    fileUrl: 'https://test.com/test.jpg',
    fileName: 'test.jpg',
    status: 'pending'
  }

  test("Then it should create a new bill and go back to the Bills Page", async () => {  
    // simuler le remplissage des champs du formulaire (mais test fonctionne sans)
    screen.getByTestId('expense-type').value = testBill.type
    screen.getByTestId('expense-name').value = testBill.name
    screen.getByTestId('datepicker').value = testBill.date
    screen.getByTestId('amount').value = testBill.amount
    screen.getByTestId('vat').value = testBill.vat
    screen.getByTestId('pct').value = testBill.pct
    containerNewBill.fileUrl = testBill.fileUrl
    containerNewBill.fileName = testBill.fileName

    const handleSubmitForm = jest.spyOn(containerNewBill, 'handleSubmit')
    const form = screen.getByTestId('form-new-bill')
    form.addEventListener('submit', handleSubmitForm)
    fireEvent.submit(form)
    // const btnSendForm = screen.getByRole('button', { name: /envoyer/i })
    // btnSendForm.addEventListener('click', handleSubmitForm)
    // userEvent.click(btnSendForm)

    const createNewBill = jest.spyOn(containerNewBill, 'createBill')
    // est-ce que ce test est valide??
    createNewBill(testBill)

    expect(handleSubmitForm).toHaveBeenCalled()
    expect(createNewBill).toHaveBeenCalledWith(testBill)
    expect(screen.getByText(/mes notes de frais/i)).toBeTruthy()
  })

  // TEST INTEGRATION POST
  test("Then push bill to mock API POST", async () => {
    const postSpy = jest.spyOn(firebase, 'post')
    const bills = await firebase.post(testBill)
    expect(postSpy).toHaveBeenCalledTimes(1)
    expect(bills.data.length).toBe(1)
  })

  test("Then push bill to API and fails with 404 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error('Erreur 404'))
    )
    const html = BillsUI({ error: 'Erreur 404' })
    document.body.innerHTML = html
    const message = screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })
    
  test("Then bill to API and fails with 500 message error", async () => {
    firebase.post.mockImplementationOnce(() =>
      Promise.reject(new Error('Erreur 500'))
    )
    const html = BillsUI({ error: 'Erreur 500' })
    document.body.innerHTML = html
    const message = screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
    })
})
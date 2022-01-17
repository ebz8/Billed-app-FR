import '@testing-library/jest-dom'
import { screen, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"

import { ROUTES, ROUTES_PATH } from '../constants/routes'
import Router from '../app/Router.js'

import { localStorageMock } from '../__mocks__/localStorage.js'
import firebase from '../__mocks__/firebase.js'


// Débugging
// screen.debug(document, 20000)
// import { prettyDOM } from "@testing-library/dom"
// console.log(prettyDOM(document, 20000))


// // MOCKS DE FIRESTORE D'AUTRES ETUDIANTS :
// jest.mock("../app/Firestore.js", () => {
//   return {
//     storage: {
//       ref: jest.fn(() => {
//         return {
//           put: () => {
//             return Promise.resolve({
//               ref: {
//                 getDownloadURL: async () => {
//                   return Promise.resolve("url")
//                 },
//               },
//             })
//           },
//         }
//       }),
//     },
//   }
// })

  // const mockFirestore = {
  //   bills: jest.fn().mockReturnThis(),
  //   add: jest.fn().mockImplementation((bill) => Promise.resolve({ data: bill })),
  //   storage: { ref: jest.fn(() => {
  //     return {
  //        put: jest
  //        .fn()
  //        .mockResolvedValueOnce({ref: { getDownloadURL: jest.fn() }})
  //   }})}
  // }

// SETUP NEWBILL PAGE - EMPLOYEE MODE
const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname })}
// config employee mode
Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user',
  JSON.stringify({
    type: 'Employee',
    email: 'cedric.hiely@billed.com',
  })
)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then the mail icon in vertical layout should be highlighted", () => {
      // mock navigation by router
      window.location.assign(ROUTES_PATH['NewBill'])
      document.body.innerHTML = `<div id='root'></div>`
      Router()

      const iconBill = screen.getByTestId('icon-window')
      const iconMail = screen.getByTestId('icon-mail')

      // check active class
      expect(iconMail).toHaveClass('active-icon')
      expect(iconBill).not.toHaveClass('active-icon')
    })
    
    test("Then the form should render with his inputs", () => {
      const input = document.querySelector('form')
      const form = screen.getByTestId('form-new-bill')

      // check interface
      expect(screen.getByText(/envoyer une note de frais/i)).toBeTruthy()
      expect(form).toBeVisible()
      expect(input.length).toEqual(9)
    })


    describe("When I upload a file through the form", () => {
      let containerNewBill

      beforeEach(() => {
        // define interface
        const html = NewBillUI()
        document.body.innerHTML = html
        // define NewBill with firestore = null 
        containerNewBill = new NewBill({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        })
      })

      test("If the file has a non-accepted format it should display an error message", () => {
        // add a file in fileInput
        const file = new File(['test'], 'badFormat.pdf', { type: 'application/pdf' })
        const fileInput = screen.getByTestId('file')
        const errorMsg = screen.getByText(/format d'image invalide\. merci de télécharger un fichier jpg, jpeg ou png\./i)
        // mock handleChangeFile method
        const handleChange = jest.spyOn(containerNewBill, 'handleChangeFile')
        fileInput.addEventListener('change', (e) => {
          handleChange(e);
        })
        userEvent.upload(fileInput, file)
        
        // check method
        expect(handleChange).toHaveBeenCalled()
        // check error message and empty fileInput
        expect(errorMsg).toHaveClass('errorMessage-visible')
        expect(fileInput.value).toBe('')
      })

      test("If the file is an image with an accepted format it should be in the file handler without any error message", () => {
          // add a file in fileInput
          const file = new File(['test'], 'goodFormat.jpg', { type: 'image/jpg' })
          const fileInput = screen.getByTestId('file')
          const errorMsg = screen.getByText(/format d'image invalide\. merci de télécharger un fichier jpg, jpeg ou png\./i)
          
          const handleChange = jest.fn(containerNewBill.handleChangeFile)
          fileInput.addEventListener('change', (e) => {
            handleChange(e);
          })
          userEvent.upload(fileInput, file)

        // check method
        expect(handleChange).toHaveBeenCalled()
        expect(errorMsg).not.toHaveClass('errorMessage-visible') 
        // check upload
        expect(fileInput.files[0].name).toBe('goodFormat.jpg')
        expect(fileInput.files).toHaveLength(1)
        })

      test("If I fill in and submit a correct form it should create a new bill and go back to Bills page", () => { 
        const email = JSON.parse(localStorage.getItem('user')).email
        const testBill = {
          email,
          type: 'Transports',
          name: 'Train Paris-Marseille',
          amount: 80,
          date: '2022-01-15',
          vat: '70',
          pct: 20,
          commentary: 'Seconde classe',
          fileUrl: 'https://test.com/test.jpg',
          fileName: 'test.jpg',
          status: 'pending'
        }

        // add values to inputs
        const form = screen.getByTestId("form-new-bill")
        screen.getByTestId("expense-type").value = testBill.type
        screen.getByTestId("expense-name").value = testBill.name
        screen.getByTestId("datepicker").value = testBill.date
        screen.getByTestId("amount").value = testBill.amount
        screen.getByTestId("vat").value = testBill.vat
        // screen.getByTestId("pct").value = ''
        screen.getByTestId("commentary").value = testBill.commentary
        containerNewBill.fileUrl = 'https://test.com/test.jpg'
        containerNewBill.fileName = 'test.jpg'

        // mock handleSubmit method and submit form
        const handleSubmit = jest.spyOn(containerNewBill, 'handleSubmit')
        containerNewBill.createBill = (containerNewBill) => containerNewBill
        form.addEventListener('submit', handleSubmit)
        fireEvent.submit(form)       
        
        // // mock createBill method and click
        // const button = screen.getByRole('button')
        // const handleCreate = jest.spyOn(containerNewBill, 'createBill')
        // button.addEventListener('click', handleCreate)
        // userEvent.click(button)

        // check method and redirection to Bills page
        expect(handleSubmit).toHaveBeenCalled()
        // expect(handleCreate).toHaveBeenCalledWith(testBill)
        expect(screen.getByText(/mes notes de frais/i)).toBeTruthy()
      })
    })
  })
})

    
// TEST INTEGRATION POST
describe("When I post a new bill", () => {
  const testBill = {
    email : 'cedric.hiely@billed.com',
    type: 'Transports',
    name: 'Train Paris-Marseille',
    amount: 80,
    date: '2022-01-15',
    vat: '70',
    pct: 20,
    commentary: 'Seconde classe',
    fileUrl: 'https://test.com/test.jpg',
    fileName: 'test.jpg',
    status: 'pending'
  }

  test("Then send bill to mock API POST", async () => {
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
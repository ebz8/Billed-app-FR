import '@testing-library/jest-dom'
import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
import firebase from '../__mocks__/firebase.js'
// import router from '../app/router.js'
// import firestore from "../app/Firestore.js"

// Débugging
import { prettyDOM } from "@testing-library/dom"
// console.log(prettyDOM(document, 20000))

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    beforeAll(() => {
      const html = NewBillUI()
			document.body.innerHTML = html

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      }
      const containerNewBill = new NewBill({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage,
      })

      // configuration de l'utilisateur
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'johndoe@email.com',
          password: 'azerty',
          status: 'connected',
        })
      )
      // configuration du router
      // window.location.assign(ROUTES_PATH['NewBill'])
    })
  })

    // affichage de l'interface NewBill
    test("Then the form should render with his inputs", () => {
      const html = NewBillUI()
			document.body.innerHTML = html
      const input = document.querySelector('form')
      const form = screen.getByTestId('form-new-bill')

      expect(screen.getByText(/envoyer une note de frais/i)).toBeTruthy()
      expect(form).toBeVisible()
      expect(input.length).toEqual(9)
    })

    describe("When I upload a file through the form", () => {
      test("This an incorrect format so it should display an error message", () => {
        const html = NewBillUI()
			  document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // copie du mock de firestore d'un étudiant
        const mockFirestore = {
          storage: {
            ref: jest.fn(() => {
              return {
                put: jest.fn()
                  .mockResolvedValueOnce({ ref: { getDownloadURL: jest.fn() } }),
              }
            }),
          }
        }
        const containerNewBill = new NewBill({
          document, onNavigate, firestore: mockFirestore, localStorage: window.localStorage,
        })
        const handleChange = jest.spyOn(containerNewBill, 'handleChangeFile')
        const fileInput = screen.getByTestId('file')
        const file = new File(['test'], 'badFormat.pdf', { type: 'application/pdf' })
        fileInput.addEventListener('change', handleChange)
        userEvent.upload(fileInput, file)
        const errorMsg = screen.getByText(/format d'image invalide\. merci de télécharger un fichier jpg, jpeg ou png\./i)

        expect(handleChange).toHaveBeenCalled()
        expect(errorMsg).toHaveClass('errorMessage-visible')
        // TODO : tester le storage du fichier : 0 fichier
        // TODO : empêche de lancer l'envoi du formulaire
      })

      test("This is a file in a correct format", () =>{
        const html = NewBillUI()
			  document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        // copie du mock de firestore d'un étudiant
        const mockFirestore = {
          storage: {
            ref: jest.fn(() => {
              return {
                put: jest
                  .fn()
                  .mockResolvedValueOnce({ ref: { getDownloadURL: jest.fn() } }),
              }
            }),
          }
        }
        const containerNewBill = new NewBill({
          document, onNavigate, firestore: mockFirestore, localStorage: window.localStorage,
        })

        const handleChange = jest.spyOn(containerNewBill, 'handleChangeFile')
        const fileInput = screen.getByTestId('file')
        const file = new File(['test'], 'goodFormat.jpg', { type: 'image/jpg' })
        fileInput.addEventListener('change', handleChange)
        userEvent.upload(fileInput, file)
        const errorMsg = screen.getByText(/format d'image invalide\. merci de télécharger un fichier jpg, jpeg ou png\./i)

        expect(handleChange).toHaveBeenCalled()
        expect(errorMsg).not.toHaveClass('errorMessage-visible')
        // expect(fileInput.files).toHaveLength(1)
        // TODO : tester le storage du fichier -> 1 fichier
      })
    })

    describe("When I submit a valid form", () => {
      test("Then it should POST a new bill ", async () => {
        const html = NewBillUI()
				document.body.innerHTML = html
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const containerNewBill = new NewBill({
          document,
          onNavigate,
          firestore: null,
          localStorage: window.localStorage,
        })

        // pourquoi ne fonctionne pas avec le beforeAll?
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock
        })
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'johndoe@email.com',
            password: 'azerty',
            status: 'connected',
          })
        )

        const btnSendForm = screen.getByRole('button')
        const handleSubmitNewBill = jest.spyOn(containerNewBill, 'handleSubmit')
        const createNewBill = jest.spyOn(containerNewBill, 'createBill')
        btnSendForm.addEventListener('click', handleSubmitNewBill)
        userEvent.click(btnSendForm)
        // fireEvent.submit(form)

        // test POST
      const postMethod = jest.spyOn(firebase, 'post')
      const email = JSON.parse(localStorage.getItem("user")).email
      const testBill = {
        email,
        type: 'Transports',
        name: 'Vol Paris Londres',
        date: '2022-01-01',
        amount: 348,
        vat: '70',
        pct: 20,
        commentary: '',
        fileUrl: 'https://test.com/test.jpg',
        fileName: 'test.jpg',
        status: 'pending'
      }

      // comment simuler le remplissage et l'envoi du formulaire ?

      const testBills = await firebase.post(testBill)
      
      // expect(handleSubmitNewBill).toHaveBeenCalled()
      // expect(createNewBill).toHaveBeenCalled()
      expect(createNewBill).toHaveBeenCalledWith(testBill)
      expect(postMethod).toHaveBeenCalledTimes(1)
      expect(testBills.data.length).toBe(5)
    })
  })
})
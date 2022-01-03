import '@testing-library/jest-dom'
import { screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { ROUTES, ROUTES_PATH } from '../constants/routes'
import { localStorageMock } from '../__mocks__/localStorage.js'
// import router from '../app/router.js'
// import firebase from '../__mocks__/firebase.js'
// import firestore from "../app/Firestore.js"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeAll(() => {
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
      window.location.assign(ROUTES_PATH['NewBill'])
    })

    test("Then the form should render with all inputs", () => {
      document.body.innerHTML = NewBillUI()
      const input = document.querySelector('form')
      const form = screen.getByTestId('form-new-bill')

      expect(screen.getByText(/envoyer une note de frais/i)).toBeTruthy()
      expect(form).toBeTruthy()
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
        const file = new File(['test'], 'badFormat.pdf', { type: 'application/pdf' })
        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener("change", handleChange)
        userEvent.upload(fileInput, file)
        const errorMsg = screen.getByText(/format d'image invalide\. merci de télécharger un fichier jpg, jpeg ou png\./i)

        // console.log(prettyDOM(document, 20000))
        expect(handleChange).toHaveBeenCalled()
        expect(errorMsg).toHaveClass('errorMessage-visible')
        // TODO : tester le storage du fichier : 0 fichier
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
        const file = new File(['test'], 'goodFormat.jpg', { type: 'image/jpg' })
        const fileInput = screen.getByTestId('file')
        fileInput.addEventListener("change", handleChange)
        userEvent.upload(fileInput, file)
        const errorMsg = screen.getByText(/format d'image invalide\. merci de télécharger un fichier jpg, jpeg ou png\./i)

        expect(handleChange).toHaveBeenCalled()
        // expect(fileInput.files).toHaveLength(1)
        expect(errorMsg).not.toHaveClass('errorMessage-visible')
        // TODO : tester le storage du fichier -> 1 fichier
      })
    })

    describe("When I submit a valid form", () => {
      test("Then it should create a new bill ", () =>{

      })

    })

  //   // integration post (post a nw bill)
  //   describe("Given I am connected as an Employee", () => {
  //     describe("When I navigate to NewBill Page", () => {
  //       // TEST GET
  //       test("fetches bills from mock API GET", async () => {
  //          const getSpy = jest.spyOn(firebase, "post")
  //          const bills = await firebase.get()
  //          expect(getSpy).toHaveBeenCalledTimes(1)
  //          expect(bills.data.length).toBe(4)
  //       })
  //       test("fetches bills from an API and fails with 404 message error", async () => {
  //         firebase.get.mockImplementationOnce(() =>
  //           Promise.reject(new Error("Erreur 404"))
  //         )
  //         const html = BillsUI({ error: "Erreur 404" })
  //         document.body.innerHTML = html
  //         const message = screen.getByText(/Erreur 404/)
  //         expect(message).toBeTruthy()
  //       })
  //       test("fetches messages from an API and fails with 500 message error", async () => {
  //         firebase.get.mockImplementationOnce(() =>
  //           Promise.reject(new Error("Erreur 500"))
  //         )
  //         const html = BillsUI({ error: "Erreur 500" })
  //         document.body.innerHTML = html
  //         const message = screen.getByText(/Erreur 500/)
  //         expect(message).toBeTruthy()
  //       })
  //     })
  })
})
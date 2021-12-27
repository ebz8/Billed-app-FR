import '@testing-library/jest-dom'
import { screen, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"

import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import { ROUTES } from '../constants/routes';

describe("Given I am connected as an Employee", () => {
  describe("When I navigate to Dashboard", () => {
    // TEST GET
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  describe("When I'm on Bills Page but it's loading", () => {
    test('Then it should render the Loading Page', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText(/loading.../i)).toBeTruthy()
    })
  })

  describe("When Bills Page can't load", () => {
    test('Then it should render the Error Page', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText(/erreur/i)).toBeTruthy()
    })
  })
  
  describe("When I am on Bills Page", () => {
    // test("Then bill icon in vertical layout should be highlighted", () => {
    //   // utilisateur
    //   // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    //   // window.localStorage.setItem('user', JSON.stringify({
    //   //   type: 'Employee'
    //   // }))

    //   Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    //   const user = JSON.stringify({
    //     type: 'Employee'
    //   })
    //   window.localStorage.setItem('user', user)
    //   // page
    //   const html = BillsUI({ data: []})      
    //   document.body.innerHTML = html

    //   const iconBill = screen.getByTestId('icon-window')
    //   const iconMail = screen.getByTestId('icon-mail')

    //   // expect(iconBill).toBeTruthy()
		// 	expect(iconBill.classList.contains('active-icon')).toBeTruthy()
    //   expect(iconMail.classList.contains('active-icon')).not.toBeTruthy()
    // })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Then I can click on the NewBill button to access to the form", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const containerBills = new Bills({
        document, onNavigate, firestore: null, localStorage: null
      })

      const handleClick = jest.spyOn(containerBills, 'handleClickNewBill')
      const buttonNewBill = screen.getByRole('button', {  name: /nouvelle note de frais/i})
      // pourquoi ne fonctionne qu'en rajoutant l'event listener déjà présent dans Bills?
      buttonNewBill.addEventListener('click', handleClick)
      userEvent.click(buttonNewBill)

      expect(handleClick).toHaveBeenCalled()
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
  })

    test("Then I can click on the Eye button to render the modal with the attached file", () => {
      // mock bootstrap
      $.fn.modal = jest.fn()

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const containerBills = new Bills({
        document, onNavigate, firestore: null, localStorage: null
      })

      const handleClick = jest.spyOn(containerBills, 'handleClickIconEye')
      const iconsEye = screen.getAllByTestId('icon-eye')
      const iconEye = iconsEye[0]
      iconEye.addEventListener('click', handleClick(iconEye))
      // fonctionne avec ou sans la simulation du clic....
      userEvent.click(iconEye)


      // tester les éléments en hidden true : comment les passer en non dissimulé?
      const modal = screen.getByRole('dialog', { hidden: true })
      // const modalTitle = screen.getByRole('heading', {  name: /justificatif/i})
      const attachedFile = iconsEye[0].getAttribute('data-bill-url').split('?')[0]

      expect(handleClick).toHaveBeenCalled()
      expect(modal).toBeVisible()
			expect(modal.innerHTML.includes(attachedFile)).toBeTruthy()
      })
  })
})

      // Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // const user = JSON.stringify({
      //   type: 'Employee'
      // })
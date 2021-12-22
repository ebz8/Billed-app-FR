import '@testing-library/jest-dom'
import { screen } from "@testing-library/dom"
// import { fireEvent, screen } from "@testing-library/dom"
// import userEvent from '@testing-library/user-event'

import BillsUI from "../views/BillsUI.js"
// import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"

import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"

describe("Given I am connected as an Employee", () => {
  // comment simuler le parcours employé / admin ? (mock navigation?)
  describe("When I'm on Bills Page but it's loading", () => {
    test('Then it should render the Loading Page', () => {
      const html = BillsUI({ loading: true })
      document.body.innerHTML = html
      expect(screen.getAllByText('Loading...')).toBeTruthy()
      // expect(getByTestId('loading-page')).toBeInTheDocument()
    })
  })

  describe("When Bills Page can't load", () => {
    test('Then it should render the Error Page', () => {
      const html = BillsUI({ error: 'some error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('Erreur')).toBeTruthy()
      // expect(getByTestId('error-message')).toBeInTheDocument()
    })
  })
  
  describe("When I am on Bills Page", () => {
    // définir le type d'ytilisateur
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const user = JSON.stringify({
      type: 'Employee'
      })
      window.localStorage.setItem('user', user)

    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: []})
      document.body.innerHTML = html
      const iconBill = screen.getByTestId('icon-window')
      const iconMail = screen.getByTestId('icon-mail')

			expect(iconBill.classList.contains('active-icon')).toBeTruthy()
      expect(iconMail.classList.contains('active-icon')).not.toBeTruthy()
    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I click on new bill button", () => {
    test("Then I arrive on NewBill Page", () => {

    })
  })

  describe("When I click on eye icon", () => {
    test("Then it opens the modal", () => {
      
    })

    test("Then the modal shows the attached file", () => {
      
    })
    
  })

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Dashboard", () => {
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
})
})

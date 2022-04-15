describe('Smoke and Elements Test', () => {

    const email = `fran${Date.now()}@gmail.com`;

    it('Register works', () => {
        cy.visit('http://localhost:3000/registro');
        cy.get('input[name=email]').type(email)
        cy.get('input[name=nombre]').type('fran')
        cy.get('input[name=password]').type('123')
        cy.get('input[name=repetirPassword]').type('123')
        cy.get('input[name=experiencia]').type('10')
        cy.get('input[name=especialidad]').type('todo')
        cy.get('input[type=file]').selectFile(__dirname +'/tony.jpg')
        cy.get('button').click()
        cy.wait(2000)
        cy.url().should('match', /login/)
    });

    it('Login, Input and button works', () => {
        cy.get('input[name=email]').type(email)
        cy.get('input[name=password]').type('123')
        cy.get('button').click()
        cy.url().should('match', /datos/)
    });
});
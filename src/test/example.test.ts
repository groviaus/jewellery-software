import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true)
  })

  it('should have access to DOM', () => {
    const element = document.createElement('div')
    element.textContent = 'Test'
    expect(element.textContent).toBe('Test')
  })
})


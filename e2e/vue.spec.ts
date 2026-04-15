import { test, expect } from '@playwright/test'

test('visits the app root url', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('AEROCORP')
})

test('navigates to different sections', async ({ page }) => {
  await page.goto('/')
  
  // Navigate to Base
  await page.click('button:has-text("Base")')
  await expect(page.locator('h2')).toContainText('base')
  
  // Navigate to Missions
  await page.click('button:has-text("Missions")')
  await expect(page.locator('h2')).toContainText('missions')
  
  // Navigate to R&D
  await page.click('button:has-text("Recherche (R&D)")')
  await expect(page.locator('h2')).toContainText('rd')
})

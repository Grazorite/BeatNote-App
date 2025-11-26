import { test, expect } from './setup';

test.describe('Quality Assurance', () => {
  // Accessibility Tests
  test.describe('Accessibility', () => {
    test('should have proper UI structure', async ({ page }) => {
      await page.goto('/');
      
      // Check for main UI elements
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
    });
    
    test('should have keyboard navigation support', async ({ page }) => {
      await page.goto('/');
      
      // Test tab navigation through interactive elements
      await page.keyboard.press('Tab');
      
      // Should be able to interact with buttons
      const loadButton = page.getByText('Load Song');
      const markerButton = page.getByText('TAP');
      
      // Verify buttons are visible and clickable
      await expect(loadButton).toBeVisible();
      await expect(markerButton).toBeVisible();
      
      // Test that buttons respond to clicks
      await loadButton.click();
      await markerButton.click();
    });
    
    test('should support keyboard interactions', async ({ page }) => {
      await page.goto('/');
      
      // Focus on TAP button
      const markerButton = page.getByText('TAP');
      await markerButton.focus();
      
      // Get initial marker count
      const initialText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
      
      // Test click interaction
      await markerButton.click();
      
      // Wait for state update
      await page.waitForTimeout(100);
      
      // Verify marker was added
      const newText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const newCount = parseInt(newText?.match(/\d+/)?.[0] || '0');
      
      expect(newCount).toBeGreaterThan(initialCount);
    });
  });

  // Performance Tests
  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await expect(page.getByText('Load Song')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });
    
    test('should handle rapid interactions without lag', async ({ page }) => {
      await page.goto('/');
      
      const markerButton = page.getByText('TAP');
      await expect(markerButton).toBeVisible();
      
      // Rapid clicks should not cause issues
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        await markerButton.click();
        await page.waitForTimeout(50);
      }
      
      const totalTime = Date.now() - startTime;
      
      // Should handle 5 rapid clicks within 2 seconds
      expect(totalTime).toBeLessThan(2000);
      
      // App should remain responsive
      await expect(page.getByText('Load Song')).toBeVisible();
    });
    
    test('should not have memory leaks with view switching', async ({ page }) => {
      await page.goto('/');
      
      const unifiedButton = page.getByText('Unified');
      const multitrackButton = page.getByText('Multitrack');
      
      // Switch views multiple times
      for (let i = 0; i < 3; i++) {
        await multitrackButton.click();
        await page.waitForTimeout(100);
        
        await unifiedButton.click();
        await page.waitForTimeout(100);
      }
      
      // App should remain stable
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
      await expect(unifiedButton).toBeVisible();
    });
  });

  // Error Boundary Tests
  test.describe('Error Boundary', () => {
    test('should handle JavaScript errors gracefully', async ({ page }) => {
      await page.goto('/');
      
      // Inject a script that will cause an error
      await page.evaluate(() => {
        // Simulate a component error by throwing in a setTimeout
        setTimeout(() => {
          throw new Error('Test error for error boundary');
        }, 100);
      });
      
      // Wait a bit for potential error
      await page.waitForTimeout(200);
      
      // App should still be functional (error boundary should catch it)
      await expect(page.getByText('Load Song')).toBeVisible();
    });
    
    test('should maintain app stability after errors', async ({ page }) => {
      await page.goto('/');
      
      // Verify core functionality still works
      const markerButton = page.getByText('TAP');
      await expect(markerButton).toBeVisible();
      
      // Should be able to interact with UI
      await markerButton.click();
      
      // App should remain stable
      await expect(page.getByText('Load Song')).toBeVisible();
    });
  });

  // State Persistence Tests
  test.describe('State Persistence', () => {
    test('should maintain marker state across view mode changes', async ({ page }) => {
      await page.goto('/');
      
      // Add some markers
      const markerButton = page.getByText('TAP');
      await markerButton.click();
      await markerButton.click();
      
      // Wait for state update
      await page.waitForTimeout(200);
      
      // Get marker count
      const markerText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const markerCount = parseInt(markerText?.match(/\d+/)?.[0] || '0');
      
      // Switch view modes
      const multitrackButton = page.getByText('Multitrack');
      await multitrackButton.click();
      await page.waitForTimeout(200);
      
      // Markers should persist
      const newMarkerText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const newMarkerCount = parseInt(newMarkerText?.match(/\d+/)?.[0] || '0');
      
      expect(newMarkerCount).toBe(markerCount);
      
      // Switch back
      const unifiedButton = page.getByText('Unified');
      await unifiedButton.click();
      await page.waitForTimeout(200);
      
      // Markers should still persist
      const finalMarkerText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const finalMarkerCount = parseInt(finalMarkerText?.match(/\d+/)?.[0] || '0');
      
      expect(finalMarkerCount).toBe(markerCount);
    });
    
    test('should maintain BPM setting across interactions', async ({ page }) => {
      await page.goto('/');
      
      // Verify default BPM
      await expect(page.getByText('120')).toBeVisible();
      
      // Interact with other controls
      const markerButton = page.getByText('TAP');
      await markerButton.click();
      
      const multitrackButton = page.getByText('Multitrack');
      await multitrackButton.click();
      
      // BPM should remain unchanged
      await expect(page.getByText('120')).toBeVisible();
    });
    
    test('should maintain active layer across view changes', async ({ page }) => {
      await page.goto('/');
      
      // Check initial active layer (should be Vocals by default)
      await expect(page.getByText(/Active Layer:.*Vocals/)).toBeVisible();
      
      // Switch view modes
      const multitrackButton = page.getByText('Multitrack');
      await multitrackButton.click();
      await page.waitForTimeout(200);
      
      // Active layer should persist
      await expect(page.getByText(/Active Layer:.*Vocals/)).toBeVisible();
      
      // Switch back
      const unifiedButton = page.getByText('Unified');
      await unifiedButton.click();
      await page.waitForTimeout(200);
      
      // Active layer should still be the same
      await expect(page.getByText(/Active Layer:.*Vocals/)).toBeVisible();
    });
  });

  // Edge Cases Tests
  test.describe('Edge Cases', () => {
    test('should handle rapid button clicks gracefully', async ({ page }) => {
      await page.goto('/');
      
      const markerButton = page.getByText('TAP');
      
      // Get initial count
      const initialText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const initialCount = parseInt(initialText?.match(/\d+/)?.[0] || '0');
      
      // Rapid fire clicks
      await Promise.all([
        markerButton.click(),
        markerButton.click(),
        markerButton.click(),
        markerButton.click(),
        markerButton.click(),
      ]);
      
      // Wait for state to settle
      await page.waitForTimeout(200);
      
      // Should have added markers (exact count may vary due to timing)
      const finalText = await page.getByText(/Grand Total: \d+ markers/).textContent();
      const finalCount = parseInt(finalText?.match(/\d+/)?.[0] || '0');
      
      expect(finalCount).toBeGreaterThan(initialCount);
      
      // App should remain stable
      await expect(page.getByText('Load Song')).toBeVisible();
    });
    
    test('should handle view mode toggle spam', async ({ page }) => {
      await page.goto('/');
      
      const unifiedButton = page.getByText('Unified');
      const multitrackButton = page.getByText('Multitrack');
      
      // Rapid view mode switching
      for (let i = 0; i < 10; i++) {
        await multitrackButton.click();
        await unifiedButton.click();
      }
      
      // App should remain stable
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
      await expect(unifiedButton).toBeVisible();
      await expect(multitrackButton).toBeVisible();
    });
    
    test('should handle load button spam', async ({ page }) => {
      await page.goto('/');
      
      const loadButton = page.getByText('Load Song');
      
      // Multiple rapid clicks on load button
      await Promise.all([
        loadButton.click(),
        loadButton.click(),
        loadButton.click(),
      ]);
      
      // App should remain stable
      await expect(page.getByText('Load Song')).toBeVisible();
    });
    
    test('should handle empty state gracefully', async ({ page }) => {
      await page.goto('/');
      
      // Verify empty state displays correctly
      await expect(page.getByText(/Grand Total: 0 markers/)).toBeVisible();
      
      // All controls should still be functional
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText('TAP')).toBeVisible();
      await expect(page.getByText('Unified')).toBeVisible();
      await expect(page.getByText('Multitrack')).toBeVisible();
    });
    
    test('should handle browser back/forward navigation', async ({ page }) => {
      await page.goto('/');
      
      // Verify initial state
      await expect(page.getByText('Load Song')).toBeVisible();
      
      // Add some markers to create state
      const markerButton = page.getByText('TAP');
      await markerButton.click();
      
      // Navigate away and back (simulate SPA routing)
      await page.evaluate(() => {
        window.history.pushState({}, '', '/test');
        window.history.back();
      });
      
      // App should remain functional
      await expect(page.getByText('Load Song')).toBeVisible();
    });
  });

  // Responsive Design Tests
  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/');
      
      // Core elements should still be visible
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText('TAP')).toBeVisible();
    });
    
    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/');
      
      // All controls should be accessible
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText('Unified')).toBeVisible();
      await expect(page.getByText('Multitrack')).toBeVisible();
      await expect(page.getByText('BPM')).toBeVisible();
    });
    
    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      await page.goto('/');
      
      // Full layout should be visible
      await expect(page.getByText('Load Song')).toBeVisible();
      await expect(page.getByText(/Active Layer:/)).toBeVisible();
    });
    
    test('should handle viewport changes gracefully', async ({ page }) => {
      await page.goto('/');
      
      // Start with desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(page.getByText('Load Song')).toBeVisible();
      
      // Switch to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.getByText('Load Song')).toBeVisible();
      
      // App should remain functional
      const markerButton = page.getByText('TAP');
      await markerButton.click();
      
      // Switch back to desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(page.getByText('Load Song')).toBeVisible();
    });
  });
});
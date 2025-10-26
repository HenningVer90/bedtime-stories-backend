// test.js
const API_URL = process.env.API_URL || 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing Bedtime Stories API...\n');

  // Test 1: Health check
  try {
    console.log('Test 1: Health Check');
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check passed:', data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Generate story
  try {
    console.log('Test 2: Generate Story');
    const response = await fetch(`${API_URL}/api/generate-story`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Write a very short bedtime story (2 sentences) about a sleepy puppy.'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Story generation passed');
      console.log('Story preview:', data.story.substring(0, 100) + '...');
    } else {
      console.log('❌ Story generation failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Story generation failed:', error.message);
  }

  console.log('\n✅ All tests completed!');
}

testAPI();
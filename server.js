// server.js
require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now, restrict later
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10mb' }));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY,
});

const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to split story into 3 parts
function splitStoryIntoParts(story) {
  const sentences = story.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const third = Math.ceil(sentences.length / 3);
  
  return {
    beginning: sentences.slice(0, third).join('. ') + '.',
    middle: sentences.slice(third, third * 2).join('. ') + '.',
    end: sentences.slice(third * 2).join('. ') + '.'
  };
}

// Function to generate image
async function generateImage(storyPart, style) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt: `Children's storybook illustration, ${style} style, colorful and friendly: ${storyPart.substring(0, 200)}`,
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bedtime Stories API is running! 📚',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      generateStory: '/api/generate-story (POST)'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Story generation endpoint
app.post('/api/generate-story', async (req, res) => {
  try {
    const { prompt, generateImages = true } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        error: 'Prompt is required' 
      });
    }

    if (prompt.length > 5000) {
      return res.status(400).json({ 
        success: false,
        error: 'Prompt is too long' 
      });
    }

    console.log('📖 Generating story...');
    console.log('Prompt length:', prompt.length, 'characters');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const storyText = message.content[0].text;
    console.log('✅ Story generated successfully');

    // Generate images if requested
    let images = null;
    if (generateImages && process.env.OPENAI_API_KEY) {
      console.log('🎨 Generating images...');
      const parts = splitStoryIntoParts(storyText);
      
      const [img1, img2, img3] = await Promise.all([
        generateImage(parts.beginning, 'beginning'),
        generateImage(parts.middle, 'middle'),
        generateImage(parts.end, 'ending')
      ]);

      images = {
        beginning: img1,
        middle: img2,
        end: img3
      };
      
      console.log('✅ Images generated');
    }

    res.json({ 
      success: true,
      story: storyText,
      images: images,
      parts: images ? splitStoryIntoParts(storyText) : null,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        tokens: message.usage?.output_tokens || 0
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.status === 401) {
      return res.status(500).json({ 
        success: false,
        error: 'API authentication failed.' 
      });
    }

    if (error.status === 429) {
      return res.status(429).json({ 
        success: false,
        error: 'Rate limit exceeded. Please try again later.' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to generate story. Please try again.'
    });
  }
});
  try {
    const { prompt } = req.body;

    // Validation
    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        error: 'Prompt is required' 
      });
    }

    if (prompt.length > 5000) {
      return res.status(400).json({ 
        success: false,
        error: 'Prompt is too long' 
      });
    }

    console.log('📖 Generating story...');
    console.log('Prompt length:', prompt.length, 'characters');

    // Generate story using Anthropic API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 1,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const storyText = message.content[0].text;

    console.log('✅ Story generated successfully');
    console.log('Story length:', storyText.length, 'characters');

    res.json({ 
      success: true,
      story: storyText,
      metadata: {
        model: 'claude-sonnet-4-20250514',
        tokens: message.usage?.output_tokens || 0
      }
    });

  } catch (error) {
    console.error('❌ Error generating story:', error.message);
    
    // Handle specific Anthropic API errors
    if (error.status === 401) {
      return res.status(500).json({ 
        success: false,
        error: 'API authentication failed. Please check configuration.' 
      });
    }

    if (error.status === 429) {
      return res.status(429).json({ 
        success: false,
        error: 'Rate limit exceeded. Please try again later.' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Failed to generate story. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log(`📚 Bedtime Stories API`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
  console.log('🚀 ================================');
  
  // Check if API key is configured
  // Debug: Log all environment variables
console.log('🔍 DEBUG: All environment variables:');
console.log('ANTHROPIC_API_KEY exists?', !!process.env.ANTHROPIC_API_KEY);
console.log('ANTHROPIC_API_KEY length:', process.env.ANTHROPIC_API_KEY?.length);
console.log('First 20 chars:', process.env.ANTHROPIC_API_KEY?.substring(0, 20));
console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('ANTHROPIC') || k.includes('API')));

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️  WARNING: ANTHROPIC_API_KEY not configured!');
} else {
  console.log('✅ Anthropic API key configured');
}
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
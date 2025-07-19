import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Heart,
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Star,
  Clock,
  User,
  Lightbulb,
  Target,
  TrendingUp,
  Award,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2
} from 'lucide-react';

const EducationalContent = ({ appData, updateAppData }) => {
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'articles', 'guides', 'myths', 'tips'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [bookmarkedItems, setBookmarkedItems] = useState(appData.bookmarks || []);

  // Educational content data
  const categories = [
    { value: 'all', label: 'All Topics', icon: BookOpen },
    { value: 'anatomy', label: 'Back Anatomy', icon: User },
    { value: 'causes', label: 'Causes & Prevention', icon: Shield },
    { value: 'treatment', label: 'Treatment Options', icon: Heart },
    { value: 'exercise', label: 'Exercise & Movement', icon: Target },
    { value: 'lifestyle', label: 'Lifestyle Tips', icon: TrendingUp },
    { value: 'myths', label: 'Myths & Facts', icon: Brain }
  ];

  const educationalArticles = [
    // Back Anatomy
    {
      id: 'anatomy-spine-basics',
      title: 'Understanding Your Spine: Basic Anatomy',
      category: 'anatomy',
      readTime: 5,
      difficulty: 'beginner',
      summary: 'Learn about the structure of your spine and how different parts work together.',
      content: `
        <h3>The Three Main Sections of Your Spine</h3>
        <p>Your spine is divided into three main sections, each with specific functions:</p>
        
        <h4>1. Cervical Spine (Neck)</h4>
        <ul>
          <li>7 vertebrae (C1-C7)</li>
          <li>Most flexible part of the spine</li>
          <li>Supports the weight of your head</li>
          <li>Allows for head movement in all directions</li>
        </ul>

        <h4>2. Thoracic Spine (Upper/Mid Back)</h4>
        <ul>
          <li>12 vertebrae (T1-T12)</li>
          <li>Connected to your rib cage</li>
          <li>Provides stability and protects organs</li>
          <li>Less flexible than other sections</li>
        </ul>

        <h4>3. Lumbar Spine (Lower Back)</h4>
        <ul>
          <li>5 vertebrae (L1-L5)</li>
          <li>Bears most of your body weight</li>
          <li>Most common area for back pain</li>
          <li>Allows for bending and twisting</li>
        </ul>

        <h3>Key Components</h3>
        <p><strong>Vertebrae:</strong> The individual bones that make up your spine</p>
        <p><strong>Discs:</strong> Cushions between vertebrae that absorb shock</p>
        <p><strong>Muscles:</strong> Support and move the spine</p>
        <p><strong>Ligaments:</strong> Connect bones and provide stability</p>
        <p><strong>Nerves:</strong> Carry signals between brain and body</p>
      `,
      tags: ['anatomy', 'spine', 'basics'],
      rating: 4.8,
      views: 1250
    },
    {
      id: 'anatomy-discs-function',
      title: 'Spinal Discs: Your Natural Shock Absorbers',
      category: 'anatomy',
      readTime: 4,
      difficulty: 'beginner',
      summary: 'Discover how spinal discs work and why they\'re crucial for back health.',
      content: `
        <h3>What Are Spinal Discs?</h3>
        <p>Spinal discs are soft, gel-like cushions between your vertebrae. They act as shock absorbers and allow your spine to move flexibly.</p>

        <h3>Disc Structure</h3>
        <h4>Nucleus Pulposus (Inner Core)</h4>
        <ul>
          <li>Soft, jelly-like center</li>
          <li>Made mostly of water (about 80%)</li>
          <li>Provides cushioning and flexibility</li>
        </ul>

        <h4>Annulus Fibrosus (Outer Ring)</h4>
        <ul>
          <li>Tough, fibrous outer layer</li>
          <li>Contains the nucleus pulposus</li>
          <li>Made of strong collagen fibers</li>
        </ul>

        <h3>How Discs Change with Age</h3>
        <p>As we age, discs naturally lose water content and become less flexible. This is normal but can contribute to back pain if not managed properly.</p>

        <h3>Keeping Your Discs Healthy</h3>
        <ul>
          <li>Stay hydrated - discs need water to function</li>
          <li>Move regularly - sitting too long compresses discs</li>
          <li>Maintain good posture</li>
          <li>Strengthen core muscles for support</li>
        </ul>
      `,
      tags: ['anatomy', 'discs', 'aging'],
      rating: 4.7,
      views: 980
    },

    // Causes & Prevention
    {
      id: 'causes-common-triggers',
      title: 'Common Causes of Back Pain',
      category: 'causes',
      readTime: 6,
      difficulty: 'beginner',
      summary: 'Understand the most common triggers of back pain and how to avoid them.',
      content: `
        <h3>Mechanical Causes (Most Common)</h3>
        
        <h4>Poor Posture</h4>
        <ul>
          <li>Slouching while sitting or standing</li>
          <li>Looking down at phones/computers</li>
          <li>Sleeping in awkward positions</li>
        </ul>

        <h4>Muscle Strain</h4>
        <ul>
          <li>Lifting heavy objects incorrectly</li>
          <li>Sudden movements or twisting</li>
          <li>Overuse from repetitive activities</li>
        </ul>

        <h4>Lifestyle Factors</h4>
        <ul>
          <li>Sedentary lifestyle</li>
          <li>Excess weight putting pressure on spine</li>
          <li>Weak core muscles</li>
          <li>Stress and tension</li>
        </ul>

        <h3>Medical Conditions</h3>
        <ul>
          <li>Herniated or bulging discs</li>
          <li>Arthritis</li>
          <li>Osteoporosis</li>
          <li>Sciatica</li>
          <li>Spinal stenosis</li>
        </ul>

        <h3>Prevention Strategies</h3>
        <h4>Daily Habits</h4>
        <ul>
          <li>Take breaks from sitting every 30 minutes</li>
          <li>Use proper lifting techniques</li>
          <li>Sleep with proper spinal alignment</li>
          <li>Manage stress through relaxation techniques</li>
        </ul>

        <h4>Exercise & Movement</h4>
        <ul>
          <li>Regular low-impact cardio</li>
          <li>Core strengthening exercises</li>
          <li>Flexibility and stretching routines</li>
          <li>Proper warm-up before activities</li>
        </ul>
      `,
      tags: ['causes', 'prevention', 'lifestyle'],
      rating: 4.9,
      views: 1850
    },

    // Treatment Options
    {
      id: 'treatment-conservative-approaches',
      title: 'Conservative Treatment Options for Back Pain',
      category: 'treatment',
      readTime: 8,
      difficulty: 'intermediate',
      summary: 'Explore non-surgical treatment options that can effectively manage back pain.',
      content: `
        <h3>First-Line Treatments</h3>
        
        <h4>Rest and Activity Modification</h4>
        <ul>
          <li>Short-term rest (1-2 days maximum)</li>
          <li>Avoid activities that worsen pain</li>
          <li>Gradually return to normal activities</li>
          <li>Bed rest is usually not recommended</li>
        </ul>

        <h4>Ice and Heat Therapy</h4>
        <p><strong>Ice (First 48 hours):</strong></p>
        <ul>
          <li>Reduces inflammation and swelling</li>
          <li>Apply for 15-20 minutes at a time</li>
          <li>Use barrier between ice and skin</li>
        </ul>
        
        <p><strong>Heat (After 48 hours):</strong></p>
        <ul>
          <li>Relaxes muscles and improves blood flow</li>
          <li>Warm baths, heating pads, or warm compresses</li>
          <li>Apply for 15-20 minutes</li>
        </ul>

        <h3>Physical Therapies</h3>
        
        <h4>Physical Therapy</h4>
        <ul>
          <li>Customized exercise programs</li>
          <li>Manual therapy techniques</li>
          <li>Posture and movement education</li>
          <li>Pain management strategies</li>
        </ul>

        <h4>Chiropractic Care</h4>
        <ul>
          <li>Spinal manipulation</li>
          <li>Soft tissue therapies</li>
          <li>Exercise recommendations</li>
          <li>Lifestyle counseling</li>
        </ul>

        <h4>Massage Therapy</h4>
        <ul>
          <li>Reduces muscle tension</li>
          <li>Improves circulation</li>
          <li>Promotes relaxation</li>
          <li>May reduce pain and stiffness</li>
        </ul>

        <h3>Alternative Therapies</h3>
        
        <h4>Acupuncture</h4>
        <ul>
          <li>May help with chronic pain</li>
          <li>Stimulates natural pain relief</li>
          <li>Generally safe when performed by licensed practitioners</li>
        </ul>

        <h4>Yoga and Tai Chi</h4>
        <ul>
          <li>Improves flexibility and strength</li>
          <li>Reduces stress and tension</li>
          <li>Low-impact movement options</li>
        </ul>

        <h3>When to Seek Medical Care</h3>
        <ul>
          <li>Pain persists beyond a few days</li>
          <li>Severe pain that doesn't improve with rest</li>
          <li>Numbness or tingling in legs</li>
          <li>Weakness in legs or feet</li>
          <li>Pain after injury or accident</li>
        </ul>
      `,
      tags: ['treatment', 'conservative', 'therapy'],
      rating: 4.8,
      views: 2100
    },

    // Exercise & Movement
    {
      id: 'exercise-daily-routine',
      title: 'Daily Exercise Routine for Back Health',
      category: 'exercise',
      readTime: 10,
      difficulty: 'intermediate',
      summary: 'A comprehensive daily routine to strengthen your back and prevent pain.',
      content: `
        <h3>Morning Routine (10 minutes)</h3>
        
        <h4>1. Gentle Wake-Up Stretches</h4>
        <ul>
          <li>Knee-to-chest pulls (30 seconds each leg)</li>
          <li>Gentle spinal twists (30 seconds each side)</li>
          <li>Cat-cow stretches (1 minute)</li>
        </ul>

        <h4>2. Core Activation</h4>
        <ul>
          <li>Deep breathing with core engagement (2 minutes)</li>
          <li>Modified planks (30 seconds, 2 sets)</li>
          <li>Bird dog holds (30 seconds each side)</li>
        </ul>

        <h3>Midday Movement Breaks</h3>
        
        <h4>Every 2 Hours</h4>
        <ul>
          <li>Stand and walk for 2-3 minutes</li>
          <li>Shoulder blade squeezes (10 repetitions)</li>
          <li>Gentle back extensions (5 repetitions)</li>
          <li>Hip flexor stretches (30 seconds each leg)</li>
        </ul>

        <h3>Evening Routine (15 minutes)</h3>
        
        <h4>Strengthening (8 minutes)</h4>
        <ul>
          <li>Glute bridges (15 reps, 2 sets)</li>
          <li>Wall sits (30 seconds, 2 sets)</li>
          <li>Side planks (20 seconds each side, 2 sets)</li>
          <li>Clamshells (15 reps each side)</li>
        </ul>

        <h4>Stretching & Relaxation (7 minutes)</h4>
        <ul>
          <li>Child's pose (1 minute)</li>
          <li>Piriformis stretch (1 minute each side)</li>
          <li>Hamstring stretches (1 minute each leg)</li>
          <li>Spinal twist (1 minute each side)</li>
          <li>Deep breathing/meditation (2 minutes)</li>
        </ul>

        <h3>Weekly Goals</h3>
        <ul>
          <li>3-4 days of cardio exercise (walking, swimming, cycling)</li>
          <li>2-3 days of strength training</li>
          <li>Daily flexibility and mobility work</li>
          <li>1-2 rest or gentle activity days</li>
        </ul>

        <h3>Exercise Modifications</h3>
        
        <h4>For Acute Pain</h4>
        <ul>
          <li>Focus on gentle stretching only</li>
          <li>Avoid exercises that increase pain</li>
          <li>Use supported positions when possible</li>
        </ul>

        <h4>For Chronic Pain</h4>
        <ul>
          <li>Start slowly and progress gradually</li>
          <li>Listen to your body</li>
          <li>Consistency is more important than intensity</li>
        </ul>
      `,
      tags: ['exercise', 'routine', 'daily'],
      rating: 4.9,
      views: 2800
    },

    // Lifestyle Tips
    {
      id: 'lifestyle-ergonomics',
      title: 'Ergonomics: Setting Up Your Workspace for Back Health',
      category: 'lifestyle',
      readTime: 7,
      difficulty: 'beginner',
      summary: 'Learn how to create a back-friendly workspace and daily environment.',
      content: `
        <h3>Desk Setup</h3>
        
        <h4>Chair Position</h4>
        <ul>
          <li>Feet flat on floor or footrest</li>
          <li>Knees at 90-degree angle</li>
          <li>Lower back supported by chair's lumbar support</li>
          <li>Sit all the way back in chair</li>
          <li>Armrests support elbows at 90 degrees</li>
        </ul>

        <h4>Monitor Placement</h4>
        <ul>
          <li>Top of screen at or below eye level</li>
          <li>20-24 inches away from your face</li>
          <li>Screen perpendicular to windows to reduce glare</li>
          <li>Use document holder at same height as monitor</li>
        </ul>

        <h4>Keyboard and Mouse</h4>
        <ul>
          <li>Keep wrists straight while typing</li>
          <li>Elbows close to body</li>
          <li>Mouse at same level as keyboard</li>
          <li>Use keyboard shortcuts to reduce mouse use</li>
        </ul>

        <h3>Movement Throughout the Day</h3>
        
        <h4>The 20-20-20 Rule</h4>
        <ul>
          <li>Every 20 minutes</li>
          <li>Look at something 20 feet away</li>
          <li>For 20 seconds</li>
          <li>Add gentle stretching during these breaks</li>
        </ul>

        <h4>Hourly Movement</h4>
        <ul>
          <li>Stand and walk for 2-3 minutes</li>
          <li>Do desk stretches</li>
          <li>Change positions</li>
          <li>Take phone calls standing</li>
        </ul>

        <h3>Sleep Ergonomics</h3>
        
        <h4>Mattress and Pillows</h4>
        <ul>
          <li>Medium-firm mattress for most people</li>
          <li>Replace mattress every 7-10 years</li>
          <li>Pillow should maintain neck alignment</li>
          <li>Consider body pillows for side sleepers</li>
        </ul>

        <h4>Sleep Positions</h4>
        <p><strong>Best positions:</strong></p>
        <ul>
          <li>On your back with pillow under knees</li>
          <li>On your side with pillow between knees</li>
        </ul>
        <p><strong>Avoid:</strong> Sleeping on stomach</p>

        <h3>Daily Activities</h3>
        
        <h4>Lifting Techniques</h4>
        <ul>
          <li>Bend knees, not back</li>
          <li>Keep object close to body</li>
          <li>Avoid twisting while lifting</li>
          <li>Get help for heavy items</li>
        </ul>

        <h4>Driving</h4>
        <ul>
          <li>Adjust seat to reach pedals comfortably</li>
          <li>Use lumbar support</li>
          <li>Take breaks on long trips</li>
          <li>Keep frequently used items within easy reach</li>
        </ul>
      `,
      tags: ['lifestyle', 'ergonomics', 'workspace'],
      rating: 4.7,
      views: 1950
    }
  ];

  const mythsAndFacts = [
    {
      id: 'myth-bed-rest',
      myth: 'Bed rest is the best treatment for back pain',
      fact: 'Extended bed rest can actually make back pain worse by weakening muscles and stiffening joints.',
      explanation: 'While short-term rest (1-2 days) may help with acute pain, staying active with gentle movement promotes healing and prevents complications.',
      category: 'treatment',
      rating: 4.8
    },
    {
      id: 'myth-no-exercise',
      myth: 'You should avoid exercise if you have back pain',
      fact: 'Appropriate exercise is one of the most effective treatments for back pain.',
      explanation: 'Regular exercise strengthens supporting muscles, improves flexibility, and can reduce pain. The key is choosing the right exercises and progressing gradually.',
      category: 'exercise',
      rating: 4.9
    },
    {
      id: 'myth-firm-mattress',
      myth: 'The firmer the mattress, the better for your back',
      fact: 'A medium-firm mattress is usually best for most people with back pain.',
      explanation: 'While a very soft mattress can lack support, an extremely firm mattress may not contour to your body\'s natural curves, potentially causing pressure points.',
      category: 'lifestyle',
      rating: 4.6
    },
    {
      id: 'myth-age-inevitable',
      myth: 'Back pain is inevitable as you age',
      fact: 'While age-related changes occur, back pain is not an inevitable part of aging.',
      explanation: 'Many older adults live pain-free lives. Staying active, maintaining good posture, and taking care of your spine can prevent many age-related back problems.',
      category: 'causes',
      rating: 4.7
    },
    {
      id: 'myth-imaging-needed',
      myth: 'You need an MRI or X-ray to diagnose back pain',
      fact: 'Most back pain can be diagnosed and treated without imaging studies.',
      explanation: 'Imaging is typically only needed if there are red flags (severe symptoms) or if conservative treatment fails. Many spine abnormalities seen on imaging are normal age-related changes.',
      category: 'treatment',
      rating: 4.5
    }
  ];

  const quickTips = [
    {
      id: 'tip-posture',
      title: 'Perfect Your Posture',
      tip: 'Imagine a string pulling you up from the top of your head. Keep shoulders relaxed and back straight.',
      category: 'lifestyle',
      icon: '🏃‍♂️'
    },
    {
      id: 'tip-hydration',
      title: 'Stay Hydrated',
      tip: 'Your spinal discs are mostly water. Drink plenty of water to keep them healthy and flexible.',
      category: 'lifestyle',
      icon: '💧'
    },
    {
      id: 'tip-movement',
      title: 'Move Every 30 Minutes',
      tip: 'Set a timer to remind yourself to stand, stretch, or walk for 2-3 minutes every half hour.',
      category: 'exercise',
      icon: '⏰'
    },
    {
      id: 'tip-sleep',
      title: 'Sleep Smart',
      tip: 'Place a pillow between your knees when sleeping on your side to maintain spinal alignment.',
      category: 'lifestyle',
      icon: '😴'
    },
    {
      id: 'tip-stress',
      title: 'Manage Stress',
      tip: 'Stress causes muscle tension. Practice deep breathing, meditation, or other relaxation techniques daily.',
      category: 'lifestyle',
      icon: '🧘‍♀️'
    },
    {
      id: 'tip-lifting',
      title: 'Lift with Your Legs',
      tip: 'Always bend your knees and keep your back straight when lifting. Let your powerful leg muscles do the work.',
      category: 'prevention',
      icon: '🏋️‍♂️'
    }
  ];

  // Filter content based on search and category
  const getFilteredContent = (content) => {
    return content.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.summary && item.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      
      return matchesCategory && matchesSearch;
    });
  };

  // Toggle bookmark
  const toggleBookmark = (itemId, type) => {
    const bookmarkId = `${type}-${itemId}`;
    let updatedBookmarks;
    
    if (bookmarkedItems.includes(bookmarkId)) {
      updatedBookmarks = bookmarkedItems.filter(id => id !== bookmarkId);
    } else {
      updatedBookmarks = [...bookmarkedItems, bookmarkId];
    }
    
    setBookmarkedItems(updatedBookmarks);
    updateAppData({ bookmarks: updatedBookmarks });
  };

  const isBookmarked = (itemId, type) => {
    return bookmarkedItems.includes(`${type}-${itemId}`);
  };

  const filteredArticles = getFilteredContent(educationalArticles);
  const filteredMyths = getFilteredContent(mythsAndFacts);
  const filteredTips = getFilteredContent(quickTips);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <BookOpen size={28} style={{ color: 'var(--secondary-600)' }} />
            Educational Content
          </h1>
          <p style={{ color: 'var(--gray-600)', margin: 0 }}>
            Learn about back health, treatment options, and prevention strategies
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-body">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}>
            {/* Search */}
            <div className="form-group mb-0">
              <label className="form-label">Search Content</label>
              <div style={{ position: 'relative' }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--gray-400)'
                  }} 
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search articles, tips, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="form-group mb-0">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
            >
              <Filter size={16} />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`nav-tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <BookOpen size={16} />
          Overview
        </button>
        <button
          className={`nav-tab ${activeView === 'articles' ? 'active' : ''}`}
          onClick={() => setActiveView('articles')}
        >
          <Brain size={16} />
          Articles ({filteredArticles.length})
        </button>
        <button
          className={`nav-tab ${activeView === 'myths' ? 'active' : ''}`}
          onClick={() => setActiveView('myths')}
        >
          <AlertTriangle size={16} />
          Myths & Facts ({filteredMyths.length})
        </button>
        <button
          className={`nav-tab ${activeView === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveView('tips')}
        >
          <Lightbulb size={16} />
          Quick Tips ({filteredTips.length})
        </button>
      </div>

      {/* Overview */}
      {activeView === 'overview' && (
        <div>
          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <Brain size={32} style={{ color: 'var(--primary-600)', marginBottom: '8px' }} />
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--primary-600)',
                  marginBottom: '4px'
                }}>
                  {educationalArticles.length}
                </div>
                <div style={{ color: 'var(--gray-600)' }}>Educational Articles</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <AlertTriangle size={32} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--warning)',
                  marginBottom: '4px'
                }}>
                  {mythsAndFacts.length}
                </div>
                <div style={{ color: 'var(--gray-600)' }}>Myths Busted</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <Lightbulb size={32} style={{ color: 'var(--secondary-600)', marginBottom: '8px' }} />
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--secondary-600)',
                  marginBottom: '4px'
                }}>
                  {quickTips.length}
                </div>
                <div style={{ color: 'var(--gray-600)' }}>Quick Tips</div>
              </div>
            </div>

            <div className="card">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <Bookmark size={32} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                <div style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--success)',
                  marginBottom: '4px'
                }}>
                  {bookmarkedItems.length}
                </div>
                <div style={{ color: 'var(--gray-600)' }}>Bookmarked Items</div>
              </div>
            </div>
          </div>

          {/* Featured Content */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Popular Articles */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} style={{ color: 'var(--primary-600)' }} />
                  Most Popular Articles
                </h3>
              </div>
              <div className="card-body">
                {educationalArticles
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 3)
                  .map(article => (
                    <div key={article.id} style={{
                      padding: '12px',
                      borderBottom: '1px solid var(--gray-200)',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedArticle(article);
                      setActiveView('articles');
                    }}>
                      <h4 style={{ margin: 0, marginBottom: '4px', fontSize: 'var(--font-size-sm)' }}>
                        {article.title}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--gray-600)'
                      }}>
                        <span>{article.views} views</span>
                        <span>•</span>
                        <span>{article.readTime} min read</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Star size={12} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                          <span>{article.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Tips Preview */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={20} style={{ color: 'var(--secondary-600)' }} />
                  Daily Tips
                </h3>
              </div>
              <div className="card-body">
                {quickTips.slice(0, 3).map(tip => (
                  <div key={tip.id} style={{
                    padding: '12px',
                    borderBottom: '1px solid var(--gray-200)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <div style={{ fontSize: '24px' }}>{tip.icon}</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, marginBottom: '4px', fontSize: 'var(--font-size-sm)' }}>
                        {tip.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--gray-600)' }}>
                        {tip.tip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Myth Buster Preview */}
            <div className="card">
              <div className="card-header">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
                  Common Myths
                </h3>
              </div>
              <div className="card-body">
                {mythsAndFacts.slice(0, 2).map(myth => (
                  <div key={myth.id} style={{
                    padding: '12px',
                    borderBottom: '1px solid var(--gray-200)'
                  }}>
                    <div style={{
                      padding: '8px',
                      backgroundColor: 'var(--error)' + '10',
                      borderRadius: 'var(--border-radius)',
                      marginBottom: '8px',
                      border: '1px solid var(--error)'
                    }}>
                      <strong style={{ color: 'var(--error)', fontSize: 'var(--font-size-xs)' }}>
                        MYTH: {myth.myth}
                      </strong>
                    </div>
                    <div style={{
                      padding: '8px',
                      backgroundColor: 'var(--success)' + '10',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--success)'
                    }}>
                      <strong style={{ color: 'var(--success)', fontSize: 'var(--font-size-xs)' }}>
                        FACT: {myth.fact}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles View */}
      {activeView === 'articles' && (
        <div>
          {selectedArticle ? (
            <div>
              {/* Article Header */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedArticle(null)}
                  style={{ marginBottom: '16px' }}
                >
                  ← Back to Articles
                </button>
                
                <div className="card">
                  <div className="card-body">
                    <div style={{ marginBottom: '16px' }}>
                      <h1 style={{ margin: 0, marginBottom: '8px' }}>{selectedArticle.title}</h1>
                      <p style={{ color: 'var(--gray-600)', margin: 0, marginBottom: '16px' }}>
                        {selectedArticle.summary}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        flexWrap: 'wrap',
                        marginBottom: '16px'
                      }}>
                        <span className={`badge badge-${selectedArticle.difficulty === 'beginner' ? 'success' : selectedArticle.difficulty === 'intermediate' ? 'warning' : 'error'}`}>
                          {selectedArticle.difficulty}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {selectedArticle.readTime} min read
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={14} />
                          {selectedArticle.views} views
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                          <span>{selectedArticle.rating}</span>
                        </div>
                        
                        <button
                          className={`btn btn-sm ${isBookmarked(selectedArticle.id, 'article') ? 'btn-success' : 'btn-secondary'}`}
                          onClick={() => toggleBookmark(selectedArticle.id, 'article')}
                        >
                          <Bookmark size={14} />
                          {isBookmarked(selectedArticle.id, 'article') ? 'Bookmarked' : 'Bookmark'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedArticle.tags.map(tag => (
                          <span key={tag} className="badge badge-secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Article Content */}
                    <div 
                      style={{ 
                        lineHeight: '1.6',
                        fontSize: 'var(--font-size-base)'
                      }}
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {filteredArticles.length === 0 ? (
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                  <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <BookOpen size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Articles Found</h3>
                    <p style={{ color: 'var(--gray-500)' }}>
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                </div>
              ) : (
                filteredArticles.map(article => (
                  <div key={article.id} className="card" style={{ cursor: 'pointer' }}>
                    <div className="card-body" onClick={() => setSelectedArticle(article)}>
                      <div style={{ marginBottom: '12px' }}>
                        <h3 style={{ margin: 0, marginBottom: '8px' }}>{article.title}</h3>
                        <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
                          {article.summary}
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--gray-600)'
                      }}>
                        <span className={`badge badge-${article.difficulty === 'beginner' ? 'success' : article.difficulty === 'intermediate' ? 'warning' : 'error'}`}>
                          {article.difficulty}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {article.readTime} min
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={12} />
                          {article.views}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Star size={12} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                          <span>{article.rating}</span>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {article.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="badge badge-secondary" style={{ fontSize: 'var(--font-size-xs)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>

                        <button
                          className={`btn btn-sm btn-icon-only ${isBookmarked(article.id, 'article') ? 'btn-success' : 'btn-secondary'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(article.id, 'article');
                          }}
                        >
                          <Bookmark size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Myths & Facts View */}
      {activeView === 'myths' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMyths.length === 0 ? (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <AlertTriangle size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Myths Found</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            </div>
          ) : (
            filteredMyths.map(myth => (
              <div key={myth.id} className="card">
                <div className="card-body">
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'var(--error)' + '10',
                      borderRadius: 'var(--border-radius)',
                      marginBottom: '12px',
                      border: '1px solid var(--error)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <X size={16} style={{ color: 'var(--error)' }} />
                        <strong style={{ color: 'var(--error)' }}>MYTH</strong>
                      </div>
                      <p style={{ margin: 0, color: 'var(--error)' }}>{myth.myth}</p>
                    </div>

                    <div style={{
                      padding: '12px',
                      backgroundColor: 'var(--success)' + '10',
                      borderRadius: 'var(--border-radius)',
                      marginBottom: '12px',
                      border: '1px solid var(--success)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                        <strong style={{ color: 'var(--success)' }}>FACT</strong>
                      </div>
                      <p style={{ margin: 0, color: 'var(--success)' }}>{myth.fact}</p>
                    </div>

                    <div style={{
                      padding: '12px',
                      backgroundColor: 'var(--primary-50)',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--primary-200)'
                    }}>
                      <p style={{ margin: 0 }}>{myth.explanation}</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Star size={12} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                      <span style={{ fontSize: 'var(--font-size-sm)' }}>{myth.rating}</span>
                    </div>

                    <button
                      className={`btn btn-sm ${isBookmarked(myth.id, 'myth') ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => toggleBookmark(myth.id, 'myth')}
                    >
                      <Bookmark size={14} />
                      {isBookmarked(myth.id, 'myth') ? 'Bookmarked' : 'Bookmark'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Tips View */}
      {activeView === 'tips' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredTips.length === 0 ? (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Lightbulb size={48} style={{ color: 'var(--gray-400)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--gray-600)', marginBottom: '8px' }}>No Tips Found</h3>
                <p style={{ color: 'var(--gray-500)' }}>
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            </div>
          ) : (
            filteredTips.map(tip => (
              <div key={tip.id} className="card">
                <div className="card-body">
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ 
                      fontSize: '32px',
                      padding: '8px',
                      backgroundColor: 'var(--secondary-50)',
                      borderRadius: 'var(--border-radius)',
                      border: '1px solid var(--secondary-200)'
                    }}>
                      {tip.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, marginBottom: '8px' }}>{tip.title}</h3>
                      <p style={{ margin: 0, color: 'var(--gray-600)' }}>{tip.tip}</p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span className={`badge badge-${tip.category === 'lifestyle' ? 'primary' : tip.category === 'exercise' ? 'success' : 'secondary'}`}>
                      {tip.category}
                    </span>

                    <button
                      className={`btn btn-sm ${isBookmarked(tip.id, 'tip') ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => toggleBookmark(tip.id, 'tip')}
                    >
                      <Bookmark size={14} />
                      {isBookmarked(tip.id, 'tip') ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EducationalContent;
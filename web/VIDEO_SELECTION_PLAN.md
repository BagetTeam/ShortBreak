# Intelligent Video Selection System - Implementation Plan

## Problem Statement
Currently, videos are fetched randomly from YouTube search results, leading to:
- Disorganized video sequences
- No logical progression through topics
- Potential duplicates
- Poor learning flow
- Mixed topics without clear transitions

## Solution: AI-Powered Video Reasoning System

### Phase 1: Data Tracking & State Management

#### 1.1 Enhanced Schema
- Add `videoSelectionState` to `prompts` table:
  - `lastSelectedTopicIndex`: Track which topic we're currently on
  - `videosShown`: Array of videoIds already displayed
  - `topicProgress`: Map of topic -> number of videos shown from that topic
  - `selectionStrategy`: Current strategy (sequential, mixed, adaptive)

#### 1.2 Video Metadata Enhancement
- Store more metadata in `feedItems`:
  - `title`: Video title from YouTube
  - `description`: Video description snippet
  - `tags`: Video tags/categories
  - `viewCount`: Engagement metric
  - `relevanceScore`: AI-calculated relevance to topic
  - `difficultyLevel`: Estimated difficulty (beginner/intermediate/advanced)

### Phase 2: Reasoning Model Architecture

#### 2.1 Video Selection Action (`selectNextVideos`)
Create a new Convex action that uses Gemini to intelligently select videos:

**Input:**
- Current prompt context
- List of already-shown videos (with metadata)
- Available outline topics
- Current topic progress
- User's viewing position

**Process:**
1. Analyze what videos have been shown
2. Determine optimal next topic/video selection
3. Generate refined search queries if needed
4. Rank and select best videos

**Output:**
- Selected videos with reasoning
- Topic progression recommendation
- Search query refinements

#### 2.2 Gemini Prompt Structure
```
You are a learning path curator. Your job is to select the next videos for a student learning about [TOPIC].

Context:
- Original learning goal: [PROMPT]
- Topics to cover: [OUTLINE_ITEMS]
- Videos already shown: [SHOWN_VIDEOS with titles/metadata]
- Current position: Topic [X] of [Y], Video [N] of current topic

Your task:
1. Analyze what the student has already watched
2. Determine the best next video(s) to show
3. Consider:
   - Logical progression through topics
   - Avoiding repetition
   - Maintaining engagement
   - Building on previous concepts
   - Appropriate difficulty curve

Respond with JSON:
{
  "nextTopicIndex": number,
  "reasoning": "explanation of selection",
  "refinedSearchQuery": "optional improved search query",
  "selectionCriteria": ["criteria1", "criteria2"],
  "expectedLearningOutcome": "what student will learn"
}
```

### Phase 3: Smart Video Fetching

#### 3.1 Enhanced Fetch Strategy
Instead of random YouTube search:
1. **Initial Load**: Fetch 3-5 videos per topic (diverse set)
2. **On Near End**: Use reasoning model to select next batch
3. **Topic Progression**: Intelligently move between topics
4. **Query Refinement**: Use AI-generated refined queries

#### 3.2 Video Ranking System
Before adding to feed, rank videos by:
- Relevance to current topic (AI-scored)
- Progression logic (builds on previous videos)
- Engagement metrics (views, recency)
- Uniqueness (not similar to shown videos)
- Difficulty progression (appropriate level)

### Phase 4: Implementation Details

#### 4.1 New Convex Action: `selectNextVideos`
```typescript
export const selectNextVideos = action({
  args: {
    promptId: v.id("prompts"),
    currentVideoIndex: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Get current state
    // 2. Get shown videos
    // 3. Get outline topics
    // 4. Call Gemini for reasoning
    // 5. Fetch videos based on reasoning
    // 6. Rank and filter videos
    // 7. Return selected videos
  }
});
```

#### 4.2 Video Deduplication
- Track all shown videoIds
- Check before adding new videos
- Use semantic similarity (via Gemini) to catch near-duplicates

#### 4.3 Topic Progression Logic
- **Sequential Mode**: Complete one topic before moving to next
- **Mixed Mode**: Interleave topics for variety
- **Adaptive Mode**: Let AI decide based on learning flow

#### 4.4 Search Query Refinement
- Use Gemini to refine search queries based on:
  - What's already been shown
  - What concepts need reinforcement
  - What's missing from the learning path

### Phase 5: User Experience Enhancements

#### 5.1 Visual Indicators
- Show topic transitions clearly
- Display progress through topics
- Indicate when new topic starts

#### 5.2 Smooth Transitions
- Ensure logical flow between videos
- Add transition videos if needed
- Maintain engagement throughout

### Phase 6: Implementation Steps

1. **Update Schema** (30 min)
   - Add selection state fields
   - Add video metadata fields

2. **Create Reasoning Action** (2-3 hours)
   - Build Gemini prompt
   - Implement selection logic
   - Add ranking system

3. **Update Fetch Logic** (1-2 hours)
   - Integrate reasoning model
   - Implement deduplication
   - Add topic progression

4. **Update Frontend** (1 hour)
   - Show topic progress
   - Display reasoning (optional)
   - Handle loading states

5. **Testing & Refinement** (1-2 hours)
   - Test with various prompts
   - Refine Gemini prompts
   - Optimize performance

### Phase 7: Advanced Features (Future)

- **User Feedback Loop**: Learn from user behavior
- **Difficulty Adaptation**: Adjust based on watch time/completion
- **Personalization**: Adapt to user's learning style
- **A/B Testing**: Test different selection strategies

## Expected Outcomes

- Coherent video sequences
- Logical topic progression
- No duplicate videos
- Better learning flow
- Higher engagement
- Personalized experience

## Technical Considerations

- **API Costs**: Gemini calls for each selection (consider caching)
- **Performance**: Batch reasoning when possible
- **Fallbacks**: If reasoning fails, use smart defaults
- **Rate Limits**: YouTube API quotas

## Success Metrics

- Reduced video repetition
- Better topic coverage
- Improved user engagement
- Smoother learning progression

# Explore Local — Build Guidelines

## Workflow
- Before coding, inspect the workspace and summarize the proposed plan, user flow, and files to change.
- Do not write or change application code until I approve the plan.
- Keep the build focused enough to complete in a 90-minute hackathon.
- After implementation, explain how to run the app and report what works and any limitations.

## Product priorities
- Make the AI Heritage Lens the main feature: accept a photo and optional place name or location, then show an engaging description with text and speaker controls.
- Put vibe-based discovery and the trip planner in a secondary Explore section.
- Make the site responsive, polished, and easy to use on mobile.
- Make every visible button work. Include clear loading, error, and empty states.

## Data and AI
- Do not hardcode destination recommendations or present invented place details as verified facts.
- Use grounded location data when available. Show source links or attribution returned by the data provider.
- Clearly label uncertain image identifications and historical claims.
- If reliable place data is unavailable, say so in the response instead of inventing details.

## Security
- Never put API keys or secrets in browser code or commit them to the repository.
- Read the Gemini API key from a server-side environment variable.
- Keep local secret files out of Git.

## Implementation
- Inspect the existing project before choosing or adding frameworks and dependencies.
- Prefer the simplest setup that supports the approved plan and Vercel deployment.
- After implementation, start the app and check the main user flows.

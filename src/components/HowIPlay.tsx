/** Working style in three phases, plus the signature move on the chalkboard. */
export default function HowIPlay() {
  return (
    <section className="s" id="how">
      <div className="s-head">
        <h2>How I play</h2>
        <p>An attacking midfielder doesn't score every goal. He sees the move before anyone else, plays the pass, and keeps the team's shape. <strong>Same job, different pitch.</strong></p>
      </div>
      <div className="phases">
        <div className="phase"><div className="k">First phase</div><h3>Read the game</h3><p>Sit with the people who have the problem. Work out what they actually need, and say it back in plain words before writing a line of code.</p><p className="kit">Discovery calls, client demos, partner outreach, presenting for the team.</p></div>
        <div className="phase"><div className="k">Second phase</div><h3>Build the move</h3><p>Pick the simplest thing that works, then build it end to end, from data pipeline to the screen someone clicks.</p><p className="kit">Python, LLMs, RAG, agents, LangGraph, FastAPI, React, AWS.</p></div>
        <div className="phase"><div className="k">Third phase</div><h3>See it out</h3><p>A lead isn't a win until the whistle. Systems get evaluated, monitored and made reproducible, so they still work next month.</p><p className="kit">Evals, LLM-as-judge, guardrails, drift monitoring, replayable runs.</p></div>
      </div>
      <div className="chalk">
        <blockquote>The model proposes. Deterministic code decides.</blockquote>
        <div className="move">
          <p><strong>Signature move: making evals stick.</strong> At Benefi nobody owned whether an LLM change was safe to ship; the check was eyeballing a few outputs. I built an eval and ran it in shadow mode. It caught a prompt change that looked fine overall but had broken one category. With caching and a fallback model it cost less than manual review, and it became the release gate for every change.</p>
          <div className="stat"><span className="n">0.97</span><span className="u">F1 on a 25,000-example golden set</span></div>
        </div>
      </div>
    </section>
  );
}

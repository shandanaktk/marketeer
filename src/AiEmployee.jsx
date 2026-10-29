// The AI employee: what the autopilot is doing, and the queue of finished work
// waiting for the user's approval. This is the main way of operating Marketeer;
// the manual studios are the override layer.
import { useEffect, useRef, useState } from 'react'
import { formatDate, formatDateTime, t } from './i18n.js'
import {
  approveAllPosts, approvePost, getAutopilot, getInbox, redraftVacancy, regeneratePost, relativeTime, runAutopilot,
  setAutopilot, toPostRecord, useResource,
} from './api.js'
import { Badge, Button, ChannelLogo, CreativeArt, Icon, LoadingState, Toggle } from './dashboardUI.jsx'

const excerpt = (text, length = 150) => (text && text.length > length ? `${text.slice(0, length).trimEnd()}…` : text || '')

function ContentLane({ status, onToggle, onRun, busy }) {
  const content = status.content
  const running = content.state.status === 'running'
  const last = content.state.last_result
  const missing = content.platforms.filter((platform) => !content.connected.includes(platform))
  return <article className="db-ai-lane">
    <header><span className="db-ai-icon"><Icon name="content" size={19} /></span><div><b>{t('Content autopilot')}</b><small>{t('{n} posts per week · {zone} · next {days} days planned ahead', { n: content.posts_per_week, zone: content.timezone, days: content.horizon_days })}</small></div><Toggle checked={content.enabled} onChange={onToggle} label={content.enabled ? t('On') : t('Off')} /></header>
    {running
      ? <p className="db-ai-working"><i /> {t('Planning the calendar and creating posts…')}</p>
      : <dl className="db-ai-facts"><div><dt>{t('Scheduled')}</dt><dd>{content.queue.scheduled}</dd></div><div><dt>{t('Awaiting approval')}</dt><dd>{content.queue.review}</dd></div><div><dt>{t('Next post')}</dt><dd>{content.next_post ? formatDateTime(content.next_post.scheduled_at) : '—'}</dd></div></dl>}
    <p className="db-helper">{content.state.last_run_at
      ? t('Last cycle {when}: {created} new posts. Next cycle {next}.', { when: relativeTime(content.state.last_run_at), created: last?.created ?? 0, next: content.enabled && content.state.next_run_at ? formatDateTime(content.state.next_run_at) : t('paused') })
      : t('The first cycle runs as soon as setup is complete.')}</p>
    {last?.errors?.length > 0 && <p className="db-warning">{last.errors.slice(0, 2).join(' · ')}</p>}
    {missing.length > 0 && <p className="db-warning">{t('Connect {channels} in Connections so approved posts can publish.', { channels: missing.join(', ') })}</p>}
    <footer><span>{content.requires_approval ? t('Every post waits for your approval.') : t('Posts publish automatically at their slot.')}</span><Button variant="secondary" icon="refresh" disabled={running || busy === 'run' || !content.enabled} onClick={onRun}>{running ? t('Working…') : t('Run now')}</Button></footer>
  </article>
}

function RecruitmentLane({ status, onGo }) {
  const recruitment = status.recruitment
  return <article className="db-ai-lane">
    <header><span className="db-ai-icon"><Icon name="ads" size={19} /></span><div><b>{t('Recruitment campaigns')}</b><small>{t('Every new vacancy becomes a complete Meta campaign draft.')}</small></div><Badge tone={recruitment.meta_connected ? 'lime' : 'orange'}>{recruitment.meta_connected ? t('Automatic') : t('Meta not connected')}</Badge></header>
    {recruitment.drafting > 0
      ? <p className="db-ai-working"><i /> {t('Building {n} campaign drafts…', { n: recruitment.drafting })}</p>
      : <dl className="db-ai-facts"><div><dt>{t('Being drafted')}</dt><dd>{recruitment.drafting}</dd></div><div><dt>{t('Ready for review')}</dt><dd>{recruitment.ready_for_review}</dd></div><div><dt>{t('Live')}</dt><dd>{recruitment.live}</dd></div></dl>}
    <p className="db-helper">{recruitment.review_before_launch ? t('You approve each campaign before it goes live in Meta.') : t('Campaigns launch in Meta automatically after drafting.')}</p>
    {!recruitment.meta_connected && <p className="db-warning">{t('Connect Meta Ads and every saved vacancy is drafted automatically.')}</p>}
    <footer><span>{t('Campaign, ad set, ads, creatives, lead form and budget.')}</span>{recruitment.meta_connected ? <Button variant="secondary" icon="plus" onClick={() => onGo('vacancies')}>{t('Add vacancy')}</Button> : <Button variant="secondary" icon="link" onClick={() => onGo('connections')}>{t('Connect Meta')}</Button>}</footer>
  </article>
}

function PostRow({ post, onApprove, onEdit, onRegenerate, busy }) {
  const record = toPostRecord(post)
  const video = record.media?.[0]?.type?.startsWith('video')
  return <article className="db-review-row">
    <div className="db-review-thumb">{record.image ? <img src={record.image} alt="" /> : <CreativeArt compact palette={record.palette} theme={record.theme || record.title.toUpperCase()} />}{video && <i><Icon name="play" size={12} /></i>}</div>
    <div className="db-review-body">
      <span className="db-review-meta"><Badge tone="blue">{t(record.format)}</Badge>{record.scheduled_at ? formatDateTime(record.scheduled_at) : t('No slot')}{record.platforms.map((platform) => <ChannelLogo platform={platform} key={platform} />)}</span>
      <b>{record.title}</b>
      <p>{post.regenerating ? t('Writing a fresh version…') : excerpt(record.caption)}</p>
      {record.error && <small className="db-warning">{record.error}</small>}
    </div>
    <div className="db-review-actions">
      <Button icon="check" disabled={Boolean(busy) || post.regenerating} onClick={onApprove}>{busy === 'approve' ? t('Approving…') : t('Approve')}</Button>
      <Button variant="ghost" icon="edit" disabled={post.regenerating} onClick={onEdit}>{t('Edit')}</Button>
      <Button variant="ghost" icon="refresh" disabled={Boolean(busy) || post.regenerating} onClick={onRegenerate}>{post.regenerating ? t('Regenerating…') : t('Regenerate')}</Button>
    </div>
  </article>
}

function CampaignRow({ vacancy, onGo, onRetry, busy }) {
  const draft = vacancy.draft || {}
  const drafting = vacancy.status === 'drafting'
  return <article className="db-review-row campaign">
    <div className="db-review-thumb"><span className="db-ai-icon"><Icon name="ads" size={20} /></span></div>
    <div className="db-review-body">
      <span className="db-review-meta"><Badge tone={drafting ? 'blue' : draft.error ? 'orange' : 'lime'}>{drafting ? t('Drafting') : draft.error ? t('Needs attention') : t('Campaign ready')}</Badge>{vacancy.location}</span>
      <b>{vacancy.title}</b>
      <p>{drafting
        ? t('The AI is building the campaign · {step}', { step: t(draft.step_label || 'Starting') })
        : draft.error
          ? draft.error
          : t('Copy, creatives, Employment audience, lead form and budget are ready for your review.')}</p>
      {drafting && <div className="db-progress"><i style={{ width: `${draft.percent || 8}%` }} /></div>}
    </div>
    <div className="db-review-actions">
      {vacancy.status === 'in review' && draft.job_id && <Button icon="arrow" onClick={() => onGo('adstudio', { vacancyId: vacancy.id, jobId: draft.job_id })}>{t('Review & launch')}</Button>}
      {vacancy.status === 'ready' && <Button variant="secondary" icon="refresh" disabled={busy} onClick={onRetry}>{busy ? t('Starting…') : t('Try again')}</Button>}
    </div>
  </article>
}

export function AiEmployee({ onGo, notify }) {
  const autopilot = useResource(getAutopilot)
  const inbox = useResource(getInbox)
  const [busy, setBusy] = useState('')
  const { reload: reloadStatus } = autopilot
  const { reload: reloadInbox } = inbox
  const running = autopilot.data?.content?.state?.status === 'running'
  const working = running || (inbox.data?.campaigns || []).some((item) => item.status === 'drafting') || (inbox.data?.posts || []).some((item) => item.regenerating)
  const wasWorking = useRef(false)

  // While the AI works, follow along; refresh once more when it finishes.
  useEffect(() => {
    if (!working) {
      if (wasWorking.current) { wasWorking.current = false; reloadInbox(); reloadStatus() }
      return undefined
    }
    wasWorking.current = true
    const timer = window.setInterval(() => { reloadStatus(); reloadInbox() }, 4000)
    return () => window.clearInterval(timer)
  }, [working, reloadStatus, reloadInbox])

  const act = async (key, work, message) => {
    setBusy(key)
    try {
      const result = await work()
      if (message) notify(typeof message === 'function' ? message(result) : message)
      return result
    } catch (failure) {
      notify(failure.message, 'error')
      return undefined
    } finally {
      setBusy('')
    }
  }
  const toggle = (enabled) => act('toggle', async () => autopilot.setData(await setAutopilot(enabled)), enabled ? t('Content autopilot is on. The first cycle is running.') : t('Content autopilot paused.'))
  const run = () => act('run', async () => autopilot.setData(await runAutopilot()), t('The AI is planning and creating your next posts.'))
  const approve = (post) => act(`approve-${post.id}`, async () => {
    await approvePost(post.id)
    inbox.setData((current) => ({ ...current, posts: current.posts.filter((item) => item.id !== post.id) }))
    reloadStatus()
  }, t('Approved. It publishes at its scheduled time.'))
  const regenerate = (post) => act(`regen-${post.id}`, async () => {
    const updated = await regeneratePost(post.id)
    inbox.setData((current) => ({ ...current, posts: current.posts.map((item) => (item.id === post.id ? updated : item)) }))
  })
  const approveAll = () => act('all', async () => {
    const result = await approveAllPosts()
    await Promise.all([reloadInbox(), reloadStatus()])
    if (result.failed.length) notify(result.failed[0], 'error')
    return result
  }, (result) => t('{n} posts approved.', { n: result.approved }))
  const retry = (vacancy) => act(`draft-${vacancy.id}`, async () => { await redraftVacancy(vacancy.id); await Promise.all([reloadInbox(), reloadStatus()]) }, t('The AI is building the campaign again.'))

  if (!autopilot.data || !inbox.data) return <LoadingState label={t('Checking what the AI has prepared…')} />
  const { posts, campaigns, failed_posts: failed } = inbox.data
  const waiting = posts.length + campaigns.filter((item) => item.status !== 'drafting').length + failed.length

  return <>
    <section className="db-card db-ai-employee">
      <header><div><span className="db-eyebrow"><Icon name="spark" size={14} /> {t('Your AI employee')}</span><h2>{t('Set up once. The work runs in the background.')}</h2><p>{t('Marketeer plans the calendar, creates and schedules posts, and turns every vacancy into a Meta campaign. You review, approve and handle exceptions.')}</p></div></header>
      <div className="db-ai-lanes"><ContentLane status={autopilot.data} onToggle={toggle} onRun={run} busy={busy} /><RecruitmentLane status={autopilot.data} onGo={onGo} /></div>
    </section>
    <section className="db-card db-review-queue">
      <header><div><span className="db-eyebrow">{t('Review queue')}</span><h2>{t('Needs your approval')}</h2></div><div>{waiting > 0 && <Badge tone="blue">{t('{n} waiting', { n: waiting })}</Badge>}{posts.length > 1 && <Button icon="check" disabled={Boolean(busy)} onClick={approveAll}>{busy === 'all' ? t('Approving…') : t('Approve all posts')}</Button>}</div></header>
      {campaigns.map((vacancy) => <CampaignRow key={vacancy.id} vacancy={vacancy} onGo={onGo} onRetry={() => retry(vacancy)} busy={busy === `draft-${vacancy.id}`} />)}
      {posts.map((post) => <PostRow key={post.id} post={post} busy={busy === `approve-${post.id}` ? 'approve' : busy === `regen-${post.id}` ? 'regen' : ''} onApprove={() => approve(post)} onEdit={() => onGo('create', toPostRecord(post))} onRegenerate={() => regenerate(post)} />)}
      {failed.map((post) => <article className="db-review-row" key={post.id}><div className="db-review-thumb">{post.image ? <img src={post.image} alt="" /> : <CreativeArt compact palette={post.palette} theme={post.title.toUpperCase()} />}</div><div className="db-review-body"><span className="db-review-meta"><Badge tone="orange">{t('Publishing failed')}</Badge>{formatDate(post.updated_at)}</span><b>{post.title}</b><small className="db-warning">{post.error}</small></div><div className="db-review-actions"><Button variant="secondary" icon="edit" onClick={() => onGo('create', toPostRecord(post))}>{t('Fix & publish')}</Button></div></article>)}
      {!campaigns.length && !posts.length && !failed.length && <p className="db-helper db-review-empty"><Icon name="check" size={15} /> {t('All caught up. New posts and campaign drafts appear here for your approval.')}</p>}
    </section>
  </>
}

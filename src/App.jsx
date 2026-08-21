import { TasksProvider } from './hooks/useTasks'
import { PrefsProvider } from './hooks/usePrefs'
import { FocusProvider, useFocus } from './hooks/useFocus'
import { AppStateProvider, useApp } from './hooks/useApp'
import { RemindersProvider } from './hooks/useReminders'
import BottomNav from './components/BottomNav'
import QuickCapture from './components/QuickCapture'
import UndoToast from './components/UndoToast'
import ReminderSheet from './components/ReminderSheet'
import ReminderAlert from './components/ReminderAlert'
import PrefsSheet from './components/PrefsSheet'
import Home from './screens/Home'
import Focus from './screens/Focus'

export default function App() {
  return (
    <TasksProvider>
      <PrefsProvider>
        <FocusProvider>
          <AppStateProvider>
            <RemindersProvider>
              <Shell />
            </RemindersProvider>
          </AppStateProvider>
        </FocusProvider>
      </PrefsProvider>
    </TasksProvider>
  )
}

function Shell() {
  const { screen, setScreen, hideChrome } = useApp()
  const { session, remainingMs } = useFocus()
  const runningHint = Boolean(session) && remainingMs > 0
  const showFab = screen === 'home'

  return (
    <div className="flex h-full w-full justify-center bg-ink">
      <div className="app-shell relative flex h-full w-full max-w-[430px] flex-col overflow-hidden">
        <main
          className={`min-h-0 flex-1 px-5 ${hideChrome ? 'flex flex-col overflow-hidden' : 'scroll-y'}`}
          style={{
            paddingTop: hideChrome
              ? 'max(0.75rem, env(safe-area-inset-top))'
              : 'max(1.15rem, env(safe-area-inset-top))',
            paddingBottom: hideChrome ? '0.35rem' : showFab ? '7.5rem' : '1rem',
          }}
        >
          {screen === 'home' ? <Home /> : <Focus />}
        </main>

        {showFab && (
          <>
            <UndoToast />
            <QuickCapture />
          </>
        )}

        {!hideChrome && (
          <BottomNav
            screen={screen}
            onChange={setScreen}
            running={runningHint}
          />
        )}

        <ReminderSheet />
        <PrefsSheet />
        <ReminderAlert />
      </div>
    </div>
  )
}

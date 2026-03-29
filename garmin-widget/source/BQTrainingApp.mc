// BQ Training — Garmin Connect IQ Widget
// Forerunner 745 — Monkey C source
//
// Fetches today's workout from /api/garmin/today and displays:
// - Workout type and distance
// - Phase and week number
// - Houston / Grasslands countdowns
//
// Set APP_URL to your deployed Vercel URL in Properties.xml

import Toybox.Application;
import Toybox.Graphics;
import Toybox.Lang;
import Toybox.WatchUi;
import Toybox.Communications;
import Toybox.Timer;

// ── Application ────────────────────────────────────────────

class BQTrainingApp extends Application.AppBase {
  function initialize() {
    AppBase.initialize();
  }

  function onStart(state as Dictionary?) as Void {}
  function onStop(state as Dictionary?) as Void {}

  function getInitialView() as [WatchUi.Views] or [WatchUi.Views, WatchUi.InputDelegates] {
    var view = new BQTrainingView();
    var delegate = new BQTrainingDelegate(view);
    return [view, delegate];
  }
}

// ── View ───────────────────────────────────────────────────

class BQTrainingView extends WatchUi.View {
  private var _workoutType as String = "Loading...";
  private var _distance as String = "";
  private var _description as String = "";
  private var _week as String = "";
  private var _houstonDays as Number = 0;
  private var _grasslandsDays as Number = 0;
  private var _loading as Boolean = true;
  private var _error as Boolean = false;

  function initialize() {
    View.initialize();
  }

  function onLayout(dc as Graphics.Dc) as Void {
    // No XML layout — drawn programmatically for maximum control
  }

  function onShow() as Void {
    fetchWorkoutData();
  }

  function onUpdate(dc as Graphics.Dc) as Void {
    // Background
    dc.setColor(0x0F172A, 0x0F172A);  // --bg-primary
    dc.fillRectangle(0, 0, dc.getWidth(), dc.getHeight());

    var w = dc.getWidth();
    var h = dc.getHeight();
    var cx = w / 2;

    if (_loading) {
      dc.setColor(0x2DD4BF, Graphics.COLOR_TRANSPARENT);  // --accent-teal
      dc.drawText(cx, h / 2, Graphics.FONT_MEDIUM, "Loading...", Graphics.TEXT_JUSTIFY_CENTER | Graphics.TEXT_JUSTIFY_VCENTER);
      return;
    }

    if (_error) {
      dc.setColor(0xEF4444, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, h / 2 - 20, Graphics.FONT_SMALL, "Sync Error", Graphics.TEXT_JUSTIFY_CENTER);
      dc.setColor(0x94A3B8, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, h / 2 + 10, Graphics.FONT_XTINY, "Check your connection", Graphics.TEXT_JUSTIFY_CENTER);
      return;
    }

    var y = 18;

    // BQ TRAINING header
    dc.setColor(0x2DD4BF, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, y, Graphics.FONT_XTINY, "BQ TRAINING", Graphics.TEXT_JUSTIFY_CENTER);
    y += 22;

    // Divider
    dc.setColor(0x1E3A5F, Graphics.COLOR_TRANSPARENT);
    dc.drawLine(20, y, w - 20, y);
    y += 8;

    // Workout type
    dc.setColor(0xF8FAFC, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, y, Graphics.FONT_LARGE, _workoutType, Graphics.TEXT_JUSTIFY_CENTER);
    y += 28;

    // Distance
    if (!_distance.equals("")) {
      dc.setColor(0x2DD4BF, Graphics.COLOR_TRANSPARENT);
      dc.drawText(cx, y, Graphics.FONT_NUMBER_MEDIUM, _distance, Graphics.TEXT_JUSTIFY_CENTER);
      y += 30;
    }

    // Week
    dc.setColor(0x94A3B8, Graphics.COLOR_TRANSPARENT);
    dc.drawText(cx, y, Graphics.FONT_XTINY, _week, Graphics.TEXT_JUSTIFY_CENTER);
    y += 18;

    // Description (truncated, 2 lines max)
    if (!_description.equals("")) {
      dc.setColor(0x64748B, Graphics.COLOR_TRANSPARENT);
      var maxLen = 32;
      var line1 = _description.length() > maxLen ? _description.substring(0, maxLen) : _description;
      dc.drawText(cx, y, Graphics.FONT_XTINY, line1, Graphics.TEXT_JUSTIFY_CENTER);
      y += 15;
      if (_description.length() > maxLen) {
        var remaining = _description.substring(maxLen, _description.length());
        if (remaining.length() > maxLen) {
          remaining = remaining.substring(0, maxLen - 3) + "...";
        }
        dc.drawText(cx, y, Graphics.FONT_XTINY, remaining, Graphics.TEXT_JUSTIFY_CENTER);
      }
      y += 15;
    }

    // Divider
    dc.setColor(0x1E3A5F, Graphics.COLOR_TRANSPARENT);
    dc.drawLine(20, y, w - 20, y);
    y += 8;

    // Countdowns row
    var halfW = (w - 40) / 2;
    // Houston
    dc.setColor(0x2DD4BF, Graphics.COLOR_TRANSPARENT);
    dc.drawText(20 + halfW / 2, y, Graphics.FONT_SMALL,
      _houstonDays > 0 ? _houstonDays.toString() : "Done",
      Graphics.TEXT_JUSTIFY_CENTER);
    dc.setColor(0x475569, Graphics.COLOR_TRANSPARENT);
    dc.drawText(20 + halfW / 2, y + 16, Graphics.FONT_XTINY, "Houston", Graphics.TEXT_JUSTIFY_CENTER);

    // Separator
    dc.setColor(0x1E3A5F, Graphics.COLOR_TRANSPARENT);
    dc.drawLine(w / 2, y - 2, w / 2, y + 30);

    // Grasslands
    dc.setColor(0xA855F7, Graphics.COLOR_TRANSPARENT);
    dc.drawText(w / 2 + 20 + halfW / 2, y, Graphics.FONT_SMALL,
      _grasslandsDays > 0 ? _grasslandsDays.toString() : "Done",
      Graphics.TEXT_JUSTIFY_CENTER);
    dc.setColor(0x475569, Graphics.COLOR_TRANSPARENT);
    dc.drawText(w / 2 + 20 + halfW / 2, y + 16, Graphics.FONT_XTINY, "Grasslands", Graphics.TEXT_JUSTIFY_CENTER);
  }

  // Called by delegate when data is refreshed
  function updateData(data as Dictionary) as Void {
    _loading = false;
    _error = false;
    _workoutType = data.get("type") as String;
    _distance    = data.get("distance") as String;
    _description = data.get("summary") as String;
    _week        = "Week " + data.get("week").toString() + " · " + data.get("phase");
    _houstonDays    = data.get("houstonDays") as Number;
    _grasslandsDays = data.get("grasslandsDays") as Number;
    WatchUi.requestUpdate();
  }

  function setError() as Void {
    _loading = false;
    _error = true;
    WatchUi.requestUpdate();
  }

  // Kick off the HTTP request
  private function fetchWorkoutData() as Void {
    // App URL is configured via Properties.xml in the Garmin project
    var appUrl = Application.Properties.getValue("AppUrl") as String;
    var url = appUrl + "/api/garmin/today";

    var options = {
      :method  => Communications.HTTP_REQUEST_METHOD_GET,
      :headers => { "Content-Type" => "application/json" },
      :responseType => Communications.HTTP_RESPONSE_CONTENT_TYPE_JSON,
    };

    Communications.makeWebRequest(url, null, options, method(:onReceive));
  }

  function onReceive(responseCode as Number, data as Dictionary or String or Null) as Void {
    if (responseCode == 200 && data instanceof Dictionary) {
      updateData(data);
    } else {
      setError();
    }
  }
}

// ── Input Delegate ─────────────────────────────────────────

class BQTrainingDelegate extends WatchUi.BehaviorDelegate {
  private var _view as BQTrainingView;
  private var _refreshTimer as Timer.Timer;

  function initialize(view as BQTrainingView) {
    BehaviorDelegate.initialize();
    _view = view;
    // Auto-refresh every 60 minutes
    _refreshTimer = new Timer.Timer();
    _refreshTimer.start(method(:onRefreshTimer), 3600000, true);
  }

  function onRefreshTimer() as Void {
    _view.onShow();
  }

  function onKey(evt as WatchUi.KeyEvent) as Boolean {
    if (evt.getKey() == WatchUi.KEY_ENTER) {
      // Manual refresh on center button press
      _view.onShow();
      return true;
    }
    return false;
  }
}

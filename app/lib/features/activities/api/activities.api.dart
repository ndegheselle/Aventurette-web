import 'package:aventurette/backend/index.dart';
import 'package:aventurette/features/activities/api/activity.mapper.dart';

final activitiesApi = crud('activities', activityMapper);

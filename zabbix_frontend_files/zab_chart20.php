<?php
/*
** ZABBIX
** Copyright (C) 2000-2010 SIA Zabbix
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
**/
?>
<?php
define('ZBX_PAGE_NO_AUTHORIZATION', true);
require_once('include/config.inc.php');

#$userlogin = new CUser();
$useropt=array(user => 'zabbix_api_user','password'=>"zabbix_api_password");
$userlogin=API::User()->login($useropt);

$page['file']	= 'zab_chart.php';
$page['type']	= PAGE_TYPE_IMAGE;
?>
<?php
//		VAR			TYPE	OPTIONAL FLAGS	VALIDATION	EXCEPTION
	$fields=array(
		'color'=>		array(T_ZBX_CLR, O_OPT, null,	null,		null),
		'drawtype'=>		array(T_ZBX_CLR, O_OPT, null,	null,		null),
		'itemid' =>		array(T_ZBX_INT, O_MAND, P_SYS,	DB_ID,		null),
		'name' =>			array(T_ZBX_STR, O_OPT, null,		null,				null),
		'period'=>		array(T_ZBX_INT, O_OPT,	null,	BETWEEN(ZBX_MIN_PERIOD,ZBX_MAX_PERIOD),	null),
		'from'=>		array(T_ZBX_INT, O_OPT,	null,	'{}>=0',	null),
		'width'=>		array(T_ZBX_INT, O_OPT,	null,	'{}>0',		null),
		'height'=>		array(T_ZBX_INT, O_OPT,	null,	'{}>0',		null),
		'border'=>		array(T_ZBX_INT, O_OPT,	null,	IN('0,1'),	null),
		'legend'=>		array(T_ZBX_INT, O_OPT,	null,	IN('0,1'),	null),
		'yaxismax'=>		array(T_ZBX_INT, O_OPT,	null,	'{}>0',		null),
		'showtriggers'=>	array(T_ZBX_INT, O_OPT,	null,	IN('0,1'),	null),
		'ymax_type'=>		array(T_ZBX_INT, O_OPT,	null,	IN('0,1,2'),	null),
		'calcfnc'=>		array(T_ZBX_INT, O_OPT,	null,	IN('0,1,2,3'),	null),
		'ymin_type' =>		array(T_ZBX_INT, O_OPT, null,		IN('0,1,2'),		null),
		'ymin_itemid' =>	array(T_ZBX_INT, O_OPT, null,		DB_ID,				null),
		'ymax_itemid' =>	array(T_ZBX_INT, O_OPT, null,		DB_ID,				null),
		'showworkperiod' =>	array(T_ZBX_INT, O_OPT, null,		IN('0,1'),			null),
		'graphtype' =>		array(T_ZBX_INT, O_OPT, null,		IN('0,1'),			null),
		'yaxismin' =>		array(T_ZBX_DBL, O_OPT, null,		null,				null),
		'yaxismax' =>		array(T_ZBX_DBL, O_OPT, null,		null,				null),
		'percent_left' =>	array(T_ZBX_DBL, O_OPT, null,		BETWEEN(0, 100),	null),
		'percent_right' =>	array(T_ZBX_DBL, O_OPT, null,		BETWEEN(0, 100),	null),
		'stime'=>		array(T_ZBX_STR, O_OPT,	P_SYS,	null,		null)
	);

	$res = check_fields($fields);
?>
<?php



	$items = array();
	if (is_array($_REQUEST['itemid'])) {
		for ($i = 0; $i < count($_REQUEST['itemid']); $i++) {
			$options = array(
				'filter' => array('itemid' => $_REQUEST['itemid'][$i]),
				'preservekeys' => 1
			);
			$db_data = API::Item()->get($options);
			if(empty($db_data)) {
//				access_deny();
				API::User()->logout($userlogin);
				exit;
			}
			$items[] = array_shift(array_keys($db_data));
		}
	}
	else {
		$options = array(
			'filter' => array('itemid' => $_REQUEST['itemid']),
			'preservekeys' => 1
		);
		$db_data = API::Item()->get($options);
		if(empty($db_data)) {
//			access_deny();
			API::User()->logout($userlogin);
			exit;
		}
		$items[] = array_shift(array_keys($db_data));
	}
	
	$graph = new CChart(get_request('graphtype', GRAPH_TYPE_NORMAL));

	$effectiveperiod = navigation_bar_calc('web.item.graph',$_REQUEST['itemid']);
	
	if(isset($_REQUEST['period']))		$graph->setPeriod($_REQUEST['period']);
	if(isset($_REQUEST['from']))		$graph->setFrom($_REQUEST['from']);
	if(isset($_REQUEST['width']))		$graph->setWidth($_REQUEST['width']);
	if(isset($_REQUEST['height']))		$graph->setHeight($_REQUEST['height']);
	if(isset($_REQUEST['border']))		$graph->setBorder(0);
	if(isset($_REQUEST['legend']))		$graph->drawLegend = $_REQUEST['legend'];
	if(isset($_REQUEST['stime']))		$graph->setSTime($_REQUEST['stime']);
	if(isset($_REQUEST['name']))		$graph->setHeader($_REQUEST['name']);
	//if(isset($_REQUEST['yaxismax']))        $graph->setYAxisMax($_REQUEST['yaxismax']);
	//if(isset($_REQUEST['ymax_type']))       $graph->setYMaxAxisType($_REQUEST['ymax_type']);
	//if(isset($_REQUEST['showtriggers']))	$graph->showTriggers($_REQUEST['showtriggers']);
	$graph->showWorkPeriod(get_request('showworkperiod', 1));
	$graph->showTriggers(get_request('showtriggers', 1));
	$graph->setYMinAxisType(get_request('ymin_type', GRAPH_YAXIS_TYPE_CALCULATED));
	$graph->setYMaxAxisType(get_request('ymax_type', GRAPH_YAXIS_TYPE_CALCULATED));
	$graph->setYAxisMin(get_request('yaxismin', 0.00));
	$graph->setYAxisMax(get_request('yaxismax', 100.00));
	$graph->setYMinItemId(get_request('ymin_itemid', 0));
	$graph->setYMaxItemId(get_request('ymax_itemid', 0));
	$graph->setLeftPercentage(get_request('percent_left', 0));
	$graph->setRightPercentage(get_request('percent_right', 0));
	
	$tarr = array( 0 => CALC_FNC_ALL, 1 => CALC_FNC_MIN, 2 => CALC_FNC_AVG, 3 => CALC_FNC_MAX );
	$calc_fnc=$tarr[get_request('calcfnc', 0)];
	
	for ($i = 0; $i < count($items); $i++) {
		//$graph->addItem($items[$i], GRAPH_YAXIS_SIDE_DEFAULT, $calc_fnc, (isset($_REQUEST['color'][$i]) ? $_REQUEST['color'][$i] : null), (isset($_REQUEST['drawtype'][$i]) ? $_REQUEST['drawtype'][$i] : null));
		$graph->addItem($items[$i], GRAPH_YAXIS_SIDE_DEFAULT, (isset($_REQUEST['calcfnc'][$i]) ? $tarr[$_REQUEST['calcfnc'][$i]] : $tarr[0]), (isset($_REQUEST['color'][$i]) ? $_REQUEST['color'][$i] : null), (isset($_REQUEST['drawtype'][$i]) ? $_REQUEST['drawtype'][$i] : null));
	}
	
	$graph->draw();
	API::User()->logout($userlogin);
?>
